package com.ecommerce.service;

import com.ecommerce.entity.Settings;
import com.ecommerce.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;

    public Map<String, String> getAllSettings() {
        return settingsRepository.findAll().stream()
            .collect(Collectors.toMap(Settings::getKey, s -> s.getValue() != null ? s.getValue() : ""));
    }

    @Transactional
    public Map<String, String> updateSettings(Map<String, String> updates) {
        updates.forEach((key, value) -> {
            Settings setting = settingsRepository.findByKey(key)
                .orElse(Settings.builder().key(key).build());
            setting.setValue(value);
            settingsRepository.save(setting);
        });
        return getAllSettings();
    }

    public String getValue(String key, String defaultValue) {
        return settingsRepository.findByKey(key).map(Settings::getValue).orElse(defaultValue);
    }
}
