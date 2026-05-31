package com.ecommerce.service;

import com.ecommerce.config.RazorpayConfig;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Payment;
import com.ecommerce.entity.Product;
import com.ecommerce.enums.NotificationType;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentStatus;
import com.ecommerce.exception.PaymentVerificationException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.util.HmacUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.razorpay.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayConfig razorpayConfig;
    private final CartService cartService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public PaymentResponse initiatePayment(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUser().getId().equals(userId))
            throw new ResourceNotFoundException("Order", "id", orderId);
        if (order.getStatus() != OrderStatus.PENDING)
            throw new IllegalArgumentException("Order is not in PENDING state");

        try {
            long amountPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
            JSONObject orderReq = new JSONObject();
            orderReq.put("amount", amountPaise);
            orderReq.put("currency", "INR");
            orderReq.put("receipt", orderId.toString());

            com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderReq);
            String rzpOrderId = rzpOrder.get("id");

            Payment payment = paymentRepository.findByOrderId(orderId).orElseGet(() -> Payment.builder()
                .order(order).amount(order.getTotalAmount()).build());
            payment.setRazorpayOrderId(rzpOrderId);
            payment.setStatus(PaymentStatus.CREATED);
            paymentRepository.save(payment);

            return PaymentResponse.builder()
                .id(payment.getId())
                .razorpayOrderId(rzpOrderId)
                .amount(order.getTotalAmount())
                .status(PaymentStatus.CREATED.name())
                .keyId(razorpayConfig.getKeyId())
                .build();
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }
    }

    @Transactional
    public Map<String, Object> verifyPayment(String rzpOrderId, String rzpPaymentId, String rzpSignature) {
        String data = rzpOrderId + "|" + rzpPaymentId;
        String expected = HmacUtils.computeHmacSha256(data, razorpayConfig.getKeySecret());

        if (!expected.equals(rzpSignature))
            throw new PaymentVerificationException("Payment signature verification failed");

        Payment payment = paymentRepository.findByRazorpayOrderId(rzpOrderId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "razorpayOrderId", rzpOrderId));

        if (payment.getStatus() == PaymentStatus.CAPTURED)
            return Map.of("success", true, "orderId", payment.getOrder().getId().toString());

        payment.setStatus(PaymentStatus.CAPTURED);
        payment.setRazorpayPaymentId(rzpPaymentId);
        payment.setRazorpaySignature(rzpSignature);
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        deductStock(order);
        cartService.clearCart(order.getUser().getId());
        emailService.sendOrderConfirmation(order);
        notificationService.create(order.getUser().getId(), NotificationType.ORDER_PLACED,
            "Order Confirmed", "Your order has been confirmed!", Map.of("orderId", order.getId().toString()));

        return Map.of("success", true, "orderId", order.getId().toString());
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        String expected = HmacUtils.computeHmacSha256(payload, razorpayConfig.getWebhookSecret());
        if (!expected.equals(signature))
            throw new PaymentVerificationException("Invalid webhook signature");

        JSONObject json = new JSONObject(payload);
        String event = json.getString("event");
        JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");

        switch (event) {
            case "payment.captured" -> {
                String rzpPaymentId = paymentEntity.getString("id");
                String rzpOrderId = paymentEntity.getString("order_id");
                paymentRepository.findByRazorpayOrderId(rzpOrderId).ifPresent(p -> {
                    if (p.getStatus() != PaymentStatus.CAPTURED) {
                        p.setStatus(PaymentStatus.CAPTURED);
                        p.setRazorpayPaymentId(rzpPaymentId);
                        paymentRepository.save(p);
                        p.getOrder().setStatus(OrderStatus.PAID);
                        orderRepository.save(p.getOrder());
                        deductStock(p.getOrder());
                        cartService.clearCart(p.getOrder().getUser().getId());
                    }
                });
            }
            case "payment.failed" -> {
                String rzpOrderId = paymentEntity.getString("order_id");
                paymentRepository.findByRazorpayOrderId(rzpOrderId).ifPresent(p -> {
                    p.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(p);
                });
            }
            case "refund.created" -> {
                JSONObject refundEntity = json.getJSONObject("payload").getJSONObject("refund").getJSONObject("entity");
                String refundId = refundEntity.getString("id");
                String rzpPaymentId = refundEntity.getString("payment_id");
                long refundAmt = refundEntity.getLong("amount");
                paymentRepository.findByRazorpayPaymentId(rzpPaymentId).ifPresent(p -> {
                    p.setRefundId(refundId);
                    p.setRefundedAmount(BigDecimal.valueOf(refundAmt).divide(BigDecimal.valueOf(100)));
                    p.setStatus(PaymentStatus.REFUNDED);
                    paymentRepository.save(p);
                });
            }
        }
    }

    @Transactional
    public void refund(UUID orderId, BigDecimal amount, UUID adminId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", orderId));
        if (payment.getStatus() != PaymentStatus.CAPTURED)
            throw new IllegalArgumentException("Cannot refund a non-captured payment");

        try {
            JSONObject refundReq = new JSONObject();
            refundReq.put("amount", amount.multiply(BigDecimal.valueOf(100)).longValue());
            Refund refund = razorpayClient.payments.refund(payment.getRazorpayPaymentId(), refundReq);
            payment.setRefundId(refund.get("id"));
            payment.setRefundedAmount(amount);
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            order.setStatus(OrderStatus.RETURNED);
            orderRepository.save(order);
            emailService.sendRefundConfirmation(order);
        } catch (RazorpayException e) {
            throw new RuntimeException("Refund failed: " + e.getMessage());
        }
    }

    private void deductStock(Order order) {
        order.getItems().forEach(item -> {
            if (item.getProductId() != null) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStockQty(Math.max(0, p.getStockQty() - item.getQty()));
                    productRepository.save(p);
                });
            }
        });
    }
}
