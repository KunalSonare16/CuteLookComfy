package com.ecommerce.repository;

import com.ecommerce.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {
    Optional<OtpCode> findTopByIdentifierOrderByCreatedAtDesc(String identifier);
}
