package com.ecommerce.controller;

import com.ecommerce.dto.response.*;
import com.ecommerce.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final AdminStatsService statsService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getStats()));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<List<RevenueDataResponse>>> getRevenue(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(statsService.getRevenue(days)));
    }

    @GetMapping("/orders-by-status")
    public ResponseEntity<ApiResponse<Map<String, Long>>> ordersByStatus() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getOrdersByStatus()));
    }

    @GetMapping("/top-products")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> topProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(ApiResponse.success(statsService.getTopProducts(limit)));
    }
}
