package com.ecommerce.service;

import com.ecommerce.dto.request.CreateCouponRequest;
import com.ecommerce.dto.response.CouponResponse;
import com.ecommerce.entity.Coupon;
import com.ecommerce.enums.CouponType;
import com.ecommerce.exception.CouponInvalidException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CouponRepository;
import com.ecommerce.repository.CouponUsageRepository;
import com.ecommerce.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public CouponResponse validateCoupon(String code, BigDecimal cartTotal, UUID userId) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
            .orElseThrow(() -> new CouponInvalidException("Invalid coupon code"));

        if (!coupon.isActive()) throw new CouponInvalidException("Coupon is no longer active");

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom()))
            throw new CouponInvalidException("Coupon is not yet valid");
        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil()))
            throw new CouponInvalidException("Coupon has expired");

        if (cartTotal.compareTo(coupon.getMinOrderAmount()) < 0)
            throw new CouponInvalidException("Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required");

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit())
            throw new CouponInvalidException("Coupon usage limit reached");

        if (userId != null && coupon.isOnePerCustomer() &&
            couponUsageRepository.existsByCouponIdAndUserId(coupon.getId(), userId))
            throw new CouponInvalidException("You have already used this coupon");

        BigDecimal discount = calculateDiscount(coupon, cartTotal);
        CouponResponse response = toCouponResponse(coupon);
        response.setDiscountAmount(discount);
        return response;
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal cartTotal) {
        return switch (coupon.getType()) {
            case PERCENTAGE -> {
                BigDecimal disc = cartTotal.multiply(coupon.getValue()).divide(BigDecimal.valueOf(100));
                if (coupon.getMaxDiscount() != null && disc.compareTo(coupon.getMaxDiscount()) > 0)
                    yield coupon.getMaxDiscount();
                yield disc;
            }
            case FIXED -> coupon.getValue().min(cartTotal);
            case FREE_SHIPPING -> BigDecimal.ZERO;
        };
    }

    @Transactional
    public CouponResponse createCoupon(CreateCouponRequest req) {
        Coupon coupon = Coupon.builder()
            .code(req.getCode().toUpperCase())
            .type(CouponType.valueOf(req.getType()))
            .value(req.getValue())
            .minOrderAmount(req.getMinOrderAmount())
            .maxDiscount(req.getMaxDiscount())
            .usageLimit(req.getUsageLimit())
            .onePerCustomer(req.isOnePerCustomer())
            .validFrom(req.getValidFrom())
            .validUntil(req.getValidUntil())
            .isActive(true)
            .build();
        return toCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CreateCouponRequest req) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        if (req.getType() != null) coupon.setType(CouponType.valueOf(req.getType()));
        if (req.getValue() != null) coupon.setValue(req.getValue());
        if (req.getMinOrderAmount() != null) coupon.setMinOrderAmount(req.getMinOrderAmount());
        if (req.getValidFrom() != null) coupon.setValidFrom(req.getValidFrom());
        if (req.getValidUntil() != null) coupon.setValidUntil(req.getValidUntil());
        return toCouponResponse(couponRepository.save(coupon));
    }

    @Transactional
    public void toggleCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon", "id", id));
        coupon.setActive(!coupon.isActive());
        couponRepository.save(coupon);
    }

    public com.ecommerce.dto.response.PagedResponse<CouponResponse> getAll(int page, int size) {
        return PaginationUtils.toPagedResponse(
            couponRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(this::toCouponResponse));
    }

    private CouponResponse toCouponResponse(Coupon c) {
        return CouponResponse.builder()
            .id(c.getId()).code(c.getCode()).type(c.getType().name())
            .value(c.getValue()).minOrderAmount(c.getMinOrderAmount())
            .maxDiscount(c.getMaxDiscount()).usageLimit(c.getUsageLimit())
            .usedCount(c.getUsedCount()).onePerCustomer(c.isOnePerCustomer())
            .validFrom(c.getValidFrom()).validUntil(c.getValidUntil())
            .isActive(c.isActive()).build();
    }
}
