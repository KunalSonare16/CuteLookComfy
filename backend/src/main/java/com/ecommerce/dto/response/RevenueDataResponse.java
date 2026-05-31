package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RevenueDataResponse {
    private String date;
    private BigDecimal revenue;
    private long orderCount;
}
