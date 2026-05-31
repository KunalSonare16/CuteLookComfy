package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateProductRequest {
    @NotBlank private String name;
    private String brand;
    private String shortDescription;
    private String description;
    private Long categoryId;
    @NotNull @Positive private BigDecimal sellingPrice;
    private BigDecimal comparePrice;
    private BigDecimal costPrice;
    private BigDecimal taxPercent;
    private String sku;
    @Min(0) private Integer stockQty = 0;
    private String sizes;
    private Integer lowStockThreshold = 5;
    private boolean allowBackorders = false;
    private Integer weightGrams;
    private boolean freeShipping = false;
    private String metaTitle;
    private String metaDescription;
    private boolean isActive = true;
    private boolean isFeatured = false;
}
