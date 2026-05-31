package com.ecommerce.repository;

import com.ecommerce.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    boolean existsByCouponIdAndUserId(Long couponId, UUID userId);
    long countByCouponId(Long couponId);
}
