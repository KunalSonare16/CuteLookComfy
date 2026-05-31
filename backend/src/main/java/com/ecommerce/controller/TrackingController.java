package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.OrderDetailResponse;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/track")
@RequiredArgsConstructor
public class TrackingController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<OrderDetailResponse>> track(@RequestParam String orderId,
                                                                    @RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.success(orderService.trackOrder(orderId, email)));
    }
}
