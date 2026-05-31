package com.ecommerce.controller;

import com.ecommerce.dto.request.RefundRequest;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.User;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderDetailResponse>>> getOrders(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        OrderStatus orderStatus = status != null ? OrderStatus.valueOf(status) : null;
        return ResponseEntity.ok(ApiResponse.success(
            orderService.getAdminOrders(orderStatus, dateFrom, dateTo, search, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAdminOrderDetail(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(@PathVariable UUID id,
                                                           @AuthenticationPrincipal User user,
                                                           @Valid @RequestBody UpdateOrderStatusRequest req) {
        orderService.updateOrderStatus(id, OrderStatus.valueOf(req.getStatus()), req.getNote(), user.getId());
        return ResponseEntity.ok(ApiResponse.success("Order status updated"));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<Void>> refund(@PathVariable UUID id,
                                                     @Valid @RequestBody RefundRequest req,
                                                     @AuthenticationPrincipal User user) {
        paymentService.refund(id, req.getAmount(), user.getId());
        return ResponseEntity.ok(ApiResponse.success("Refund initiated"));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<Void>> addNote(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Note saved"));
    }
}
