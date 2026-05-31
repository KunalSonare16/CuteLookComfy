package com.ecommerce.dto.request;

import lombok.*;

import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateSettingsRequest {
    private Map<String, String> settings;
}
