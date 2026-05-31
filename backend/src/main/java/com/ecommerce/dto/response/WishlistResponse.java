package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class WishlistResponse {
    private Long id;
    private UUID productId;
    private String productName;
    private String productSlug;
    private String productImage;
    private BigDecimal sellingPrice;
    private BigDecimal comparePrice;
    private Integer stockQty;
    private LocalDateTime addedAt;
}
