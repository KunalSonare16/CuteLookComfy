package com.ecommerce.service;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.*;
import com.ecommerce.enums.NotificationType;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.exception.*;
import com.ecommerce.repository.*;
import com.ecommerce.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public OrderDetailResponse createOrder(User user, CreateOrderRequest req) {
        CartResponse cart = cartService.getCart(user.getId());
        if (cart.getItems().isEmpty()) throw new IllegalArgumentException("Cart is empty");

        Address address = addressRepository.findById(req.getAddressId())
            .orElseThrow(() -> new ResourceNotFoundException("Address", "id", req.getAddressId()));
        if (!address.getUser().getId().equals(user.getId()))
            throw new UnauthorizedException("Address does not belong to you");

        BigDecimal subtotal = cart.getSubtotal();
        BigDecimal discount = BigDecimal.ZERO;
        Coupon coupon = null;

        if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
            CouponResponse couponResp = couponService.validateCoupon(req.getCouponCode(), subtotal, user.getId());
            discount = couponResp.getDiscountAmount();
        }

        // Flat ₹50 shipping on every order
        BigDecimal shipping = new BigDecimal("50");
        BigDecimal total = subtotal.subtract(discount).add(shipping);
        String paymentMethod = (req.getPaymentMethod() != null && !req.getPaymentMethod().isBlank())
            ? req.getPaymentMethod().toUpperCase() : "RAZORPAY";

        Map<String, Object> shippingAddr = Map.of(
            "name", address.getName(), "phone", address.getPhone(),
            "line1", address.getLine1(), "line2", Objects.toString(address.getLine2(), ""),
            "city", address.getCity(), "state", address.getState(), "pincode", address.getPincode()
        );

        Order order = Order.builder()
            .user(user).status(OrderStatus.PENDING)
            .subtotal(subtotal).discountAmount(discount)
            .couponCode(req.getCouponCode()).shippingCharge(shipping)
            .totalAmount(total).shippingAddress(new HashMap<>(shippingAddr))
            .paymentMethod(paymentMethod)
            .notes(req.getNotes()).build();

        order = orderRepository.save(order);

        for (CartResponse.CartItemResponse item : cart.getItems()) {
            Product product = productRepository.findById(UUID.fromString(item.getProductId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", item.getProductId()));
            if (!product.isAllowBackorders() && product.getStockQty() < item.getQty())
                throw new InsufficientStockException("Insufficient stock for: " + product.getName());

            // Decrement inventory at order placement (reserves stock, prevents overselling)
            product.setStockQty(Math.max(0, product.getStockQty() - item.getQty()));
            productRepository.save(product);

            OrderItem oi = OrderItem.builder()
                .order(order).productId(product.getId()).variantId(item.getVariantId())
                .size(item.getSize())
                .productName(item.getProductName()).productImage(item.getProductImage())
                .qty(item.getQty()).unitPrice(item.getUnitPrice()).totalPrice(item.getTotalPrice())
                .build();
            orderItemRepository.save(oi);
        }

        recordHistory(order, OrderStatus.PENDING, user.getId(), "Order placed");
        return toOrderDetailResponse(order);
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getUserOrders(User user, OrderStatus status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var orders = status != null ?
            orderRepository.findByUserAndStatusOrderByCreatedAtDesc(user, status, pageable) :
            orderRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return PaginationUtils.toPagedResponse(orders.map(this::toOrderResponse));
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(UUID orderId, User user) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedException("Access denied");
        return toOrderDetailResponse(order);
    }

    @Transactional
    public void cancelOrder(UUID orderId, User user) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedException("Access denied");
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID)
            throw new IllegalArgumentException("Order cannot be cancelled at this stage");
        if (order.getCreatedAt().plusMinutes(60).isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Cancellation window has expired");

        // Restore inventory for cancelled order
        for (OrderItem item : order.getItems()) {
            productRepository.findById(item.getProductId()).ifPresent(p -> {
                p.setStockQty(p.getStockQty() + item.getQty());
                productRepository.save(p);
            });
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        recordHistory(order, OrderStatus.CANCELLED, user.getId(), "Cancelled by customer");
        emailService.sendOrderCancelled(order);
        notificationService.create(user.getId(), NotificationType.CANCELLED,
            "Order Cancelled", "Your order has been cancelled.", Map.of("orderId", orderId.toString()));
    }

    @Transactional
    public void updateOrderStatus(UUID orderId, OrderStatus status, String note, UUID adminId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        order.setStatus(status);
        orderRepository.save(order);
        recordHistory(order, status, adminId, note);

        switch (status) {
            case SHIPPED -> emailService.sendOrderShipped(order);
            case DELIVERED -> emailService.sendOrderDelivered(order);
            case CANCELLED -> emailService.sendOrderCancelled(order);
        }
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getAdminOrderDetail(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return toOrderDetailResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderByIdAndEmail(UUID orderId, String email) {
        Order order = orderRepository.findByIdAndUserEmail(orderId, email)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return toOrderDetailResponse(order);
    }

    /** Track by full UUID or by the short order number (e.g. "AC9B8FB3" or "#AC9B8FB3") + email. */
    @Transactional(readOnly = true)
    public OrderDetailResponse trackOrder(String orderIdInput, String email) {
        if (orderIdInput == null || orderIdInput.isBlank())
            throw new IllegalArgumentException("Please enter your order ID");
        String prefix = orderIdInput.replace("#", "").trim();
        var matches = orderRepository.findByEmailAndIdPrefix(email, prefix);
        if (matches.isEmpty())
            throw new IllegalArgumentException("No order found with that order ID and email");
        return toOrderDetailResponse(matches.get(0));
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderDetailResponse> getAdminOrders(OrderStatus status, LocalDateTime dateFrom,
            LocalDateTime dateTo, String search, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PaginationUtils.toPagedResponse(
            orderRepository.findAllAdmin(status, dateFrom, dateTo, search, pageable)
                .map(this::toOrderDetailResponse));
    }

    private void recordHistory(Order order, OrderStatus status, UUID userId, String note) {
        historyRepository.save(OrderStatusHistory.builder()
            .order(order).status(status).changedByUserId(userId).note(note).build());
    }

    private OrderResponse toOrderResponse(Order o) {
        String firstName = o.getItems().isEmpty() ? "" : o.getItems().get(0).getProductName();
        String firstImg = o.getItems().isEmpty() ? null : o.getItems().get(0).getProductImage();
        return OrderResponse.builder()
            .id(o.getId()).status(o.getStatus().name())
            .subtotal(o.getSubtotal()).discountAmount(o.getDiscountAmount())
            .shippingCharge(o.getShippingCharge()).totalAmount(o.getTotalAmount())
            .couponCode(o.getCouponCode()).itemCount(o.getItems().size())
            .firstItemName(firstName).firstItemImage(firstImg)
            .createdAt(o.getCreatedAt()).build();
    }

    public OrderDetailResponse toOrderDetailResponse(Order o) {
        List<OrderStatusHistory> history = historyRepository.findByOrderIdOrderByChangedAtDesc(o.getId());
        return OrderDetailResponse.builder()
            .id(o.getId()).status(o.getStatus().name())
            .customerName(o.getUser() != null ? o.getUser().getName() : null)
            .customerEmail(o.getUser() != null ? o.getUser().getEmail() : null)
            .subtotal(o.getSubtotal()).discountAmount(o.getDiscountAmount())
            .shippingCharge(o.getShippingCharge()).totalAmount(o.getTotalAmount())
            .paymentMethod(o.getPaymentMethod())
            .couponCode(o.getCouponCode()).shippingAddress(o.getShippingAddress())
            .notes(o.getNotes())
            .items(o.getItems().stream().map(i -> OrderDetailResponse.OrderItemResponse.builder()
                .id(i.getId()).productId(i.getProductId() != null ? i.getProductId().toString() : null)
                .variantId(i.getVariantId()).size(i.getSize()).productName(i.getProductName())
                .productImage(i.getProductImage()).qty(i.getQty())
                .unitPrice(i.getUnitPrice()).totalPrice(i.getTotalPrice()).build())
                .collect(Collectors.toList()))
            .statusHistory(history.stream().map(h -> OrderDetailResponse.StatusHistoryResponse.builder()
                .status(h.getStatus().name()).note(h.getNote()).changedAt(h.getChangedAt()).build())
                .collect(Collectors.toList()))
            .createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt()).build();
    }
}
