package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);
    Optional<Product> findByIdAndDeletedAtIsNull(UUID id);

    @Query("""
        SELECT p FROM Product p
        WHERE p.deletedAt IS NULL
        AND (:categoryId IS NULL OR p.category.id = :categoryId)
        AND (:minPrice IS NULL OR p.sellingPrice >= :minPrice)
        AND (:maxPrice IS NULL OR p.sellingPrice <= :maxPrice)
        AND (CAST(:brand AS String) IS NULL OR LOWER(p.brand) = LOWER(CAST(:brand AS String)))
        AND (CAST(:search AS String) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
        AND (:featured IS NULL OR p.isFeatured = :featured)
        AND (:inStock IS NULL OR (:inStock = TRUE AND p.stockQty > 0) OR (:inStock = FALSE))
        AND p.isActive = TRUE
    """)
    Page<Product> findAllWithFilters(
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("brand") String brand,
        @Param("search") String search,
        @Param("featured") Boolean featured,
        @Param("inStock") Boolean inStock,
        Pageable pageable
    );

    @Query("SELECT p FROM Product p WHERE p.isActive = TRUE AND p.deletedAt IS NULL AND p.isFeatured = TRUE")
    List<Product> findFeatured(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = TRUE AND p.deletedAt IS NULL ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND (:includeInactive = TRUE OR p.isActive = TRUE)")
    Page<Product> findAllAdmin(@Param("includeInactive") boolean includeInactive, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL ORDER BY p.stockQty ASC")
    Page<Product> findAllOrderByStockAsc(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deletedAt IS NULL AND p.stockQty <= p.lowStockThreshold")
    List<Product> findLowStockProducts();

    long countByDeletedAtIsNull();
    long countByIsActiveAndDeletedAtIsNull(boolean isActive);
}
