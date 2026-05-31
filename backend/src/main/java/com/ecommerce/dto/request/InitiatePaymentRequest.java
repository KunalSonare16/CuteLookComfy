package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class InitiatePaymentRequest {
    @NotNull(message = "Order ID is required")
    private UUID orderId;
}
