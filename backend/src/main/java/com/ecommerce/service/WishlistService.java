package com.ecommerce.service;

import com.ecommerce.dto.response.WishlistResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(UUID userId) {
        return wishlistRepository.findByUserId(userId).stream()
            .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(UUID userId, UUID productId, User user) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) return;
        Product product = productRepository.findByIdAndDeletedAtIsNull(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
        wishlistRepository.save(WishlistItem.builder().user(user).product(product).build());
    }

    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    private WishlistResponse toResponse(WishlistItem w) {
        Product p = w.getProduct();
        String img = p.getImages().stream().filter(ProductImage::isFeatured).findFirst()
            .or(() -> p.getImages().stream().findFirst())
            .map(ProductImage::getImageUrl).orElse(null);
        return WishlistResponse.builder()
            .id(w.getId()).productId(p.getId()).productName(p.getName())
            .productSlug(p.getSlug()).productImage(img)
            .sellingPrice(p.getSellingPrice()).comparePrice(p.getComparePrice())
            .stockQty(p.getStockQty()).addedAt(w.getAddedAt()).build();
    }
}
