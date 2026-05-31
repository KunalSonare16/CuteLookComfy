package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDetailResponse {
    private UUID id;
    private String status;
    private String customerName;
    private String customerEmail;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingCharge;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String couponCode;
    private Map<String, Object> shippingAddress;
    private String notes;
    private List<OrderItemResponse> items;
    private PaymentResponse payment;
    private List<StatusHistoryResponse> statusHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private String productId;
        private Long variantId;
        private String size;
        private String productName;
        private String productImage;
        private Integer qty;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatusHistoryResponse {
        private String status;
        private String note;
        private LocalDateTime changedAt;
    }
}
