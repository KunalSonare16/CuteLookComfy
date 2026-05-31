package com.ecommerce.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ReturnResponse {
    private Long id;
    private UUID orderId;
    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String reason;
    private String description;
    private String status;
    private String refundMethod;
    private LocalDateTime createdAt;
}
