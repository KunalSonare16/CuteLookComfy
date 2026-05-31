package com.ecommerce.repository;

import com.ecommerce.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProductIdAndIsApprovedTrue(UUID productId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.isApproved = TRUE")
    Double avgRatingByProduct(@Param("productId") UUID productId);

    Optional<Review> findByProductIdAndUserId(UUID productId, UUID userId);
    boolean existsByProductIdAndUserId(UUID productId, UUID userId);

    Page<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT r FROM Review r WHERE (:approved IS NULL OR r.isApproved = :approved) ORDER BY r.createdAt DESC")
    Page<Review> findAllAdmin(@Param("approved") Boolean approved, Pageable pageable);
}
