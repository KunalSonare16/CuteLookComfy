package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductDetailResponse {
    private UUID id;
    private String name;
    private String slug;
    private String brand;
    private String shortDescription;
    private String description;
    private Long categoryId;
    private String categoryName;
    private BigDecimal sellingPrice;
    private BigDecimal comparePrice;
    private BigDecimal costPrice;
    private BigDecimal taxPercent;
    private String sku;
    private String sizes;
    private Integer stockQty;
    private Integer lowStockThreshold;
    private boolean allowBackorders;
    private Integer weightGrams;
    private boolean freeShipping;
    private String metaTitle;
    private String metaDescription;
    private boolean isActive;
    private boolean isFeatured;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;
    private Double avgRating;
    private Long reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductImageResponse {
        private Long id;
        private String imageUrl;
        private Integer displayOrder;
        private boolean isFeatured;
    }
}
