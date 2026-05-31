package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateOrderRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.User;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.service.InvoiceService;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.ReturnService;
import com.ecommerce.dto.request.CreateReturnRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final InvoiceService invoiceService;
    private final ReturnService returnService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDetailResponse>> createOrder(@AuthenticationPrincipal User user,
                                                                         @Valid @RequestBody CreateOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(orderService.createOrder(user, req)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getOrders(
        @AuthenticationPrincipal User user,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        OrderStatus orderStatus = status != null ? OrderStatus.valueOf(status) : null;
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(user, orderStatus, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrder(@AuthenticationPrincipal User user,
                                                                       @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderDetail(id, user)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(@AuthenticationPrincipal User user, @PathVariable UUID id) {
        orderService.cancelOrder(id, user);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully"));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> getInvoice(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        byte[] pdf = invoiceService.generateInvoice(id);
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
            .body(pdf);
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<ApiResponse<Object>> createReturn(@AuthenticationPrincipal User user,
                                                             @PathVariable UUID id,
                                                             @RequestBody CreateReturnRequest req) {
        return ResponseEntity.ok(ApiResponse.success(returnService.createReturn(id, user, req)));
    }

    @GetMapping("/{id}/return")
    public ResponseEntity<ApiResponse<Object>> getReturn(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(returnService.getReturnByOrder(id)));
    }
}
