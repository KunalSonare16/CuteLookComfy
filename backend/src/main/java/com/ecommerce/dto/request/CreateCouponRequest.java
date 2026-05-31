package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateCouponRequest {
    @NotBlank private String code;
    @NotBlank private String type;
    @NotNull @Positive private BigDecimal value;
    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private boolean onePerCustomer = false;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
}
