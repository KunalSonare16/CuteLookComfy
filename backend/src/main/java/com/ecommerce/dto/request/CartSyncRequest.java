package com.ecommerce.dto.request;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CartSyncRequest {
    private List<CartItem> items;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class CartItem {
        private UUID productId;
        private Long variantId;
        private String size;
        private int qty;
    }
}
