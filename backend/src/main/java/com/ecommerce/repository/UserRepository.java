package com.ecommerce.repository;

import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE (CAST(:search AS String) IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))) AND (:role IS NULL OR u.role = :role)")
    Page<User> findAllWithFilters(String search, Role role, Pageable pageable);

    long countByRole(Role role);
}
