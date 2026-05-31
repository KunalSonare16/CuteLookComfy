package com.ecommerce.controller;

import com.ecommerce.dto.request.ApplyCouponRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CouponResponse>> validate(@AuthenticationPrincipal User user,
                                                                  @RequestBody ApplyCouponRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
            couponService.validateCoupon(req.getCode(), req.getCartTotal(), user.getId())));
    }
}
