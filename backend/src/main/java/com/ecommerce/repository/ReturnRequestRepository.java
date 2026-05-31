package com.ecommerce.repository;

import com.ecommerce.entity.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    Optional<ReturnRequest> findByOrderId(UUID orderId);
    Page<ReturnRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
