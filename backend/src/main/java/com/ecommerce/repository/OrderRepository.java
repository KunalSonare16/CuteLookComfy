package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.User;
import com.ecommerce.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Page<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status, Pageable pageable);

    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
        AND (CAST(:dateFrom AS timestamp) IS NULL OR o.createdAt >= :dateFrom)
        AND (CAST(:dateTo AS timestamp) IS NULL OR o.createdAt <= :dateTo)
        AND (CAST(:search AS String) IS NULL OR CAST(o.id AS String) LIKE CONCAT('%', CAST(:search AS String), '%'))
        ORDER BY o.createdAt DESC
    """)
    Page<Order> findAllAdmin(
        @Param("status") OrderStatus status,
        @Param("dateFrom") LocalDateTime dateFrom,
        @Param("dateTo") LocalDateTime dateTo,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('PAID','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED') AND o.createdAt >= :from AND o.createdAt < :to")
    BigDecimal sumRevenueByPeriod(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :from AND o.createdAt < :to")
    long countByPeriod(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(AVG(o.totalAmount), 0) FROM Order o WHERE o.status IN ('PAID','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED')")
    BigDecimal avgOrderValue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN ('PAID','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED')")
    BigDecimal sumTotalRevenue();

    Optional<Order> findByIdAndUserEmail(UUID id, String email);

    // Track by the short order number (first 8 chars of the UUID) + email
    @Query("SELECT o FROM Order o WHERE LOWER(o.user.email) = LOWER(:email) " +
           "AND LOWER(CAST(o.id AS string)) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY o.createdAt DESC")
    List<Order> findByEmailAndIdPrefix(@Param("email") String email, @Param("prefix") String prefix);
}
