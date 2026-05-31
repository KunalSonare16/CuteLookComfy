package com.ecommerce.service;

import com.ecommerce.dto.request.CreateProductRequest;
import com.ecommerce.dto.response.*;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.util.PaginationUtils;
import com.ecommerce.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final ProductVariantRepository variantRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> getProducts(int page, int size, Long categoryId,
            BigDecimal minPrice, BigDecimal maxPrice, String sort, String brand,
            String search, Boolean featured, Boolean inStock) {
        Pageable pageable = buildProductPageable(page, size, sort);
        Page<Product> products = productRepository.findAllWithFilters(
            categoryId, minPrice, maxPrice, brand, search, featured, inStock, pageable);
        return PaginationUtils.toPagedResponse(products.map(this::toProductResponse));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "product", key = "#slug")
    public ProductDetailResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugAndDeletedAtIsNull(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return toProductDetailResponse(product);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "products:featured")
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findFeatured(PageRequest.of(0, 8))
            .stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getNewArrivals() {
        return productRepository.findNewArrivals(PageRequest.of(0, 8))
            .stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Product> products = productRepository.findAllWithFilters(
            null, null, null, null, q, null, null, pageable);
        return PaginationUtils.toPagedResponse(products.map(this::toProductResponse));
    }

    @Transactional
    @CacheEvict(value = {"product", "products:featured"}, allEntries = true)
    public ProductDetailResponse createProduct(CreateProductRequest req) {
        Category category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.getCategoryId()));
        }

        String slug = generateUniqueSlug(req.getName());
        Product product = Product.builder()
            .name(req.getName())
            .slug(slug)
            .brand(req.getBrand())
            .shortDescription(req.getShortDescription())
            .description(req.getDescription())
            .category(category)
            .sellingPrice(req.getSellingPrice())
            .comparePrice(req.getComparePrice())
            .costPrice(req.getCostPrice())
            .taxPercent(req.getTaxPercent() != null ? req.getTaxPercent() : BigDecimal.ZERO)
            .sku(req.getSku())
            .sizes(req.getSizes())
            .stockQty(req.getStockQty())
            .lowStockThreshold(req.getLowStockThreshold())
            .allowBackorders(req.isAllowBackorders())
            .weightGrams(req.getWeightGrams())
            .freeShipping(req.isFreeShipping())
            .metaTitle(req.getMetaTitle())
            .metaDescription(req.getMetaDescription())
            .isActive(req.isActive())
            .isFeatured(req.isFeatured())
            .build();

        return toProductDetailResponse(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = {"product", "products:featured"}, allEntries = true)
    public ProductDetailResponse updateProduct(UUID id, CreateProductRequest req) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (req.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", req.getCategoryId())));
        }
        if (req.getName() != null) product.setName(req.getName());
        if (req.getBrand() != null) product.setBrand(req.getBrand());
        if (req.getShortDescription() != null) product.setShortDescription(req.getShortDescription());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getSellingPrice() != null) product.setSellingPrice(req.getSellingPrice());
        if (req.getComparePrice() != null) product.setComparePrice(req.getComparePrice());
        if (req.getStockQty() != null) product.setStockQty(req.getStockQty());
        if (req.getSizes() != null) product.setSizes(req.getSizes());
        product.setActive(req.isActive());
        product.setFeatured(req.isFeatured());
        product.setFreeShipping(req.isFreeShipping());

        return toProductDetailResponse(productRepository.save(product));
    }

    @Transactional
    @CacheEvict(value = {"product", "products:featured"}, allEntries = true)
    public void softDeleteProduct(UUID id) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setDeletedAt(LocalDateTime.now());
        productRepository.save(product);
    }

    @Transactional
    @CacheEvict(value = {"product", "products:featured"}, allEntries = true)
    public void toggleActive(UUID id) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(!product.isActive());
        productRepository.save(product);
    }

    @Transactional
    public void updateStock(UUID id, int qty) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setStockQty(qty);
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductDetailResponse> getAdminProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return PaginationUtils.toPagedResponse(
            productRepository.findAllAdmin(true, pageable).map(this::toProductDetailResponse));
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductDetailResponse> getInventory(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PaginationUtils.toPagedResponse(
            productRepository.findAllOrderByStockAsc(pageable).map(this::toProductDetailResponse));
    }

    private String generateUniqueSlug(String name) {
        String base = SlugUtils.toSlug(name);
        String slug = base;
        int counter = 1;
        while (productRepository.findBySlugAndDeletedAtIsNull(slug).isPresent()) {
            slug = base + "-" + counter++;
        }
        return slug;
    }

    private Pageable buildProductPageable(int page, int size, String sort) {
        Sort.Order order = switch (sort != null ? sort : "newest") {
            case "price_asc", "price-asc" -> Sort.Order.asc("sellingPrice");
            case "price_desc", "price-desc" -> Sort.Order.desc("sellingPrice");
            case "popular" -> Sort.Order.desc("isFeatured");
            case "name" -> Sort.Order.asc("name");
            default -> Sort.Order.desc("createdAt");
        };
        return PageRequest.of(page, size, Sort.by(order));
    }

    public ProductResponse toProductResponse(Product p) {
        Double avgRating = reviewRepository.avgRatingByProduct(p.getId());
        String featuredImg = p.getImages().stream()
            .filter(ProductImage::isFeatured).findFirst()
            .or(() -> p.getImages().stream().findFirst())
            .map(ProductImage::getImageUrl).orElse(null);

        return ProductResponse.builder()
            .id(p.getId())
            .name(p.getName())
            .slug(p.getSlug())
            .brand(p.getBrand())
            .shortDescription(p.getShortDescription())
            .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
            .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
            .sellingPrice(p.getSellingPrice())
            .comparePrice(p.getComparePrice())
            .stockQty(p.getStockQty())
            .isActive(p.isActive())
            .isFeatured(p.isFeatured())
            .freeShipping(p.isFreeShipping())
            .featuredImageUrl(featuredImg)
            .avgRating(avgRating)
            .createdAt(p.getCreatedAt())
            .build();
    }

    public ProductDetailResponse toProductDetailResponse(Product p) {
        Double avgRating = reviewRepository.avgRatingByProduct(p.getId());
        return ProductDetailResponse.builder()
            .id(p.getId())
            .name(p.getName())
            .slug(p.getSlug())
            .brand(p.getBrand())
            .shortDescription(p.getShortDescription())
            .description(p.getDescription())
            .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
            .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
            .sellingPrice(p.getSellingPrice())
            .comparePrice(p.getComparePrice())
            .costPrice(p.getCostPrice())
            .taxPercent(p.getTaxPercent())
            .sku(p.getSku())
            .sizes(p.getSizes())
            .stockQty(p.getStockQty())
            .lowStockThreshold(p.getLowStockThreshold())
            .allowBackorders(p.isAllowBackorders())
            .weightGrams(p.getWeightGrams())
            .freeShipping(p.isFreeShipping())
            .metaTitle(p.getMetaTitle())
            .metaDescription(p.getMetaDescription())
            .isActive(p.isActive())
            .isFeatured(p.isFeatured())
            .images(p.getImages().stream().map(img -> ProductDetailResponse.ProductImageResponse.builder()
                .id(img.getId()).imageUrl(img.getImageUrl())
                .displayOrder(img.getDisplayOrder()).isFeatured(img.isFeatured()).build())
                .collect(Collectors.toList()))
            .variants(p.getVariants().stream().map(v -> ProductVariantResponse.builder()
                .id(v.getId()).attributeName(v.getAttributeName())
                .attributeValue(v.getAttributeValue()).priceOverride(v.getPriceOverride())
                .stockQty(v.getStockQty()).sku(v.getSku()).isActive(v.isActive()).build())
                .collect(Collectors.toList()))
            .avgRating(avgRating)
            .createdAt(p.getCreatedAt())
            .updatedAt(p.getUpdatedAt())
            .build();
    }
}
