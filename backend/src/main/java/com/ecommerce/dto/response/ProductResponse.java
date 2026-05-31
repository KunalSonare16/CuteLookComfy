package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private String name;
    private String slug;
    private String brand;
    private String shortDescription;
    private String categoryName;
    private Long categoryId;
    private BigDecimal sellingPrice;
    private BigDecimal comparePrice;
    private Integer stockQty;
    private boolean isActive;
    private boolean isFeatured;
    private boolean freeShipping;
    private String featuredImageUrl;
    private Double avgRating;
    private Long reviewCount;
    private LocalDateTime createdAt;
}
