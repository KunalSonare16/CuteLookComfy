package com.ecommerce.controller;

import com.ecommerce.dto.request.*;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(user.getId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@AuthenticationPrincipal User user,
                                                              @Valid @RequestBody AddToCartRequest req) {
        return ResponseEntity.ok(ApiResponse.success(cartService.addItem(user.getId(), req)));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(@AuthenticationPrincipal User user,
                                                                 @PathVariable UUID productId,
                                                                 @RequestParam int qty) {
        return ResponseEntity.ok(ApiResponse.success(cartService.updateItem(user.getId(), productId, qty)));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(@AuthenticationPrincipal User user,
                                                                 @PathVariable UUID productId) {
        return ResponseEntity.ok(ApiResponse.success(cartService.removeItem(user.getId(), productId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }

    @PostMapping("/sync")
    public ResponseEntity<ApiResponse<CartResponse>> syncCart(@AuthenticationPrincipal User user,
                                                               @RequestBody CartSyncRequest req) {
        return ResponseEntity.ok(ApiResponse.success(cartService.syncCart(user.getId(), req)));
    }

    @PostMapping("/apply-coupon")
    public ResponseEntity<ApiResponse<CartResponse>> applyCoupon(@AuthenticationPrincipal User user,
                                                                   @RequestBody ApplyCouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success(cartService.applyCoupon(user.getId(), req.getCode())));
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<CartResponse>> removeCoupon(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(cartService.removeCoupon(user.getId())));
    }
}
