package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductVariantResponse {
    private Long id;
    private String attributeName;
    private String attributeValue;
    private BigDecimal priceOverride;
    private Integer stockQty;
    private String sku;
    private boolean isActive;
}
