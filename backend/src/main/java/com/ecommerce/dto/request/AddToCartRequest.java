package com.ecommerce.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AddToCartRequest {
    @NotNull(message = "Product ID is required")
    private UUID productId;
    private Long variantId;
    private String size;
    @Min(value = 1, message = "Quantity must be at least 1")
    private int qty = 1;

    public AddToCartRequest(UUID productId, Long variantId, int qty) {
        this.productId = productId;
        this.variantId = variantId;
        this.qty = qty;
    }
}
