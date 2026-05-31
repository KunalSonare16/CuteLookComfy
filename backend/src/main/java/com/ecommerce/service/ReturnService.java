package com.ecommerce.service;

import com.ecommerce.dto.request.CreateReturnRequest;
import com.ecommerce.dto.response.ReturnResponse;
import com.ecommerce.entity.*;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.ReturnStatus;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.ReturnWindowExpiredException;
import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final ReturnRequestRepository returnRepository;
    private final OrderRepository orderRepository;
    private final SettingsRepository settingsRepository;
    private final PaymentService paymentService;
    private final EmailService emailService;

    private ReturnResponse toResponse(ReturnRequest r) {
        Order o = r.getOrder();
        return ReturnResponse.builder()
            .id(r.getId())
            .orderId(o != null ? o.getId() : null)
            .orderNumber(o != null ? o.getId().toString().substring(0, 8).toUpperCase() : null)
            .customerName(o != null && o.getUser() != null ? o.getUser().getName() : null)
            .customerEmail(o != null && o.getUser() != null ? o.getUser().getEmail() : null)
            .reason(r.getReason())
            .description(r.getDescription())
            .status(r.getStatus().name())
            .refundMethod(r.getRefundMethod())
            .createdAt(r.getCreatedAt())
            .build();
    }

    @Transactional
    public ReturnResponse createReturn(UUID orderId, User user, CreateReturnRequest req) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUser().getId().equals(user.getId()))
            throw new UnauthorizedException("Access denied");
        if (order.getStatus() != OrderStatus.DELIVERED)
            throw new IllegalArgumentException("Order is not delivered yet");

        int returnWindowDays = settingsRepository.findByKey("return_window_days")
            .map(s -> Integer.parseInt(s.getValue())).orElse(7);

        if (order.getUpdatedAt().plusDays(returnWindowDays).isBefore(LocalDateTime.now()))
            throw new ReturnWindowExpiredException("Return window of " + returnWindowDays + " days has expired");

        if (returnRepository.findByOrderId(orderId).isPresent())
            throw new IllegalArgumentException("Return request already exists for this order");

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        orderRepository.save(order);

        ReturnRequest returnReq = ReturnRequest.builder()
            .order(order).orderItemId(req.getOrderItemId()).userId(user.getId())
            .reason(req.getReason()).description(req.getDescription())
            .status(ReturnStatus.REQUESTED).refundMethod(req.getRefundMethod())
            .pickupAddressId(req.getPickupAddressId()).build();

        ReturnRequest saved = returnRepository.save(returnReq);
        emailService.sendReturnConfirmation(order);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public ReturnResponse getReturnByOrder(UUID orderId) {
        return returnRepository.findByOrderId(orderId)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "orderId", orderId));
    }

    @Transactional
    public ReturnResponse updateReturnStatus(Long returnId, String status) {
        ReturnRequest req = returnRepository.findById(returnId)
            .orElseThrow(() -> new ResourceNotFoundException("ReturnRequest", "id", returnId));
        ReturnStatus newStatus = ReturnStatus.valueOf(status);
        req.setStatus(newStatus);

        if (newStatus == ReturnStatus.APPROVED) {
            Order order = req.getOrder();
            order.setStatus(OrderStatus.RETURNED);
            orderRepository.save(order);
            if (order.getPayment() != null)
                paymentService.refund(order.getId(), order.getTotalAmount(), null);
        }
        return toResponse(returnRepository.save(req));
    }

    @Transactional(readOnly = true)
    public com.ecommerce.dto.response.PagedResponse<ReturnResponse> getAdminReturns(int page, int size) {
        var pageable = PageRequest.of(page, size);
        var page2 = returnRepository.findAllByOrderByCreatedAtDesc(pageable);
        return com.ecommerce.dto.response.PagedResponse.<ReturnResponse>builder()
            .content(page2.getContent().stream().map(this::toResponse).toList())
            .page(page2.getNumber()).size(page2.getSize())
            .totalElements(page2.getTotalElements()).totalPages(page2.getTotalPages())
            .last(page2.isLast()).build();
    }
}
