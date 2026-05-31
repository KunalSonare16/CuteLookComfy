package com.ecommerce.repository;

import com.ecommerce.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("SELECT oi.productId, oi.productName, SUM(oi.qty) as totalQty, SUM(oi.totalPrice) as totalRevenue FROM OrderItem oi GROUP BY oi.productId, oi.productName ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts(Pageable pageable);

    boolean existsByOrderUserIdAndProductId(UUID userId, UUID productId);

    // True if the user has placed an order (not cancelled) containing this product
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.order.user.id = :userId AND oi.productId = :productId " +
           "AND oi.order.status <> 'CANCELLED'")
    boolean hasPurchased(@Param("userId") UUID userId, @Param("productId") UUID productId);

    List<OrderItem> findByOrderId(UUID orderId);
}
