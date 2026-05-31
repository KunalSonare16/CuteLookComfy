package com.ecommerce.repository;

import com.ecommerce.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SettingsRepository extends JpaRepository<Settings, Long> {
    Optional<Settings> findByKey(String key);
    boolean existsByKey(String key);
}
