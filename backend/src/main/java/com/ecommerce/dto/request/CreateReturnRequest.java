package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateReturnRequest {
    private Long orderItemId;
    @NotBlank private String reason;
    private String description;
    private String refundMethod;
    private Long pickupAddressId;
}
