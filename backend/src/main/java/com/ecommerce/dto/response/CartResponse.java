package com.ecommerce.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class CartResponse {
    private List<CartItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private String couponCode;
    private BigDecimal shippingCharge;
    private BigDecimal total;
    private int itemCount;

    @Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemResponse {
        private String productId;
        private Long variantId;
        private String productName;
        private String productImage;
        private String slug;
        private BigDecimal unitPrice;
        private Integer qty;
        private BigDecimal totalPrice;
        private Integer stockQty;
        private String variantLabel;
        private String size;
    }
}
