package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateProductRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.ProductImage;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.FileStorageService;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductDetailResponse>>> getAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAdminProducts(page, size)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductDetailResponse>> create(
        @RequestPart("data") CreateProductRequest req,
        @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        ProductDetailResponse product = productService.createProduct(req);
        if (images != null && !images.isEmpty()) {
            addImagesToProduct(product.getId(), images);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(product));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getOne(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAdminProducts(0, 1).getContent()
            .stream().filter(p -> p.getId().equals(id)).findFirst()
            .orElseThrow()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> update(@PathVariable UUID id,
                                                                       @RequestBody CreateProductRequest req) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        productService.softDeleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable UUID id) {
        productService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success("Product status toggled"));
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<Void>> uploadImages(@PathVariable UUID id,
                                                           @RequestParam("files") List<MultipartFile> files) {
        addImagesToProduct(id, files);
        return ResponseEntity.ok(ApiResponse.success("Images uploaded"));
    }

    @DeleteMapping("/{productId}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable UUID productId, @PathVariable Long imageId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new com.ecommerce.exception.ResourceNotFoundException("Product", "id", productId));
        product.getImages().stream().filter(img -> img.getId().equals(imageId)).findFirst()
            .ifPresent(img -> {
                fileStorageService.deleteFile(img.getImageUrl());
                product.getImages().remove(img);
            });
        productRepository.save(product);
        return ResponseEntity.ok(ApiResponse.success("Image deleted"));
    }

    private void addImagesToProduct(UUID productId, List<MultipartFile> images) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new com.ecommerce.exception.ResourceNotFoundException("Product", "id", productId));
        boolean first = product.getImages().isEmpty();
        for (MultipartFile file : images) {
            String url = fileStorageService.storeFile(file);
            ProductImage img = ProductImage.builder()
                .product(product).imageUrl(url)
                .displayOrder(product.getImages().size())
                .isFeatured(first).build();
            product.getImages().add(img);
            first = false;
        }
        productRepository.save(product);
    }
}
