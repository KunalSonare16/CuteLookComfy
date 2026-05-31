package com.ecommerce.controller;

import com.ecommerce.dto.response.*;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminInventoryController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductDetailResponse>>> getInventory(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "50") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(productService.getInventory(page, size)));
    }

    @PatchMapping("/{productId}/stock")
    public ResponseEntity<ApiResponse<Void>> updateStock(@PathVariable UUID productId,
                                                          @RequestBody Map<String, Integer> body) {
        productService.updateStock(productId, body.get("qty"));
        return ResponseEntity.ok(ApiResponse.success("Stock updated"));
    }
}
