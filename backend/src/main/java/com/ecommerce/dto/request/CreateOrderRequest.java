package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateOrderRequest {
    @NotNull(message = "Address ID is required")
    private Long addressId;
    private String couponCode;
    private String notes;
    private String paymentMethod;
}
