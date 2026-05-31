package com.ecommerce.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminUserResponse {
    private UUID id;
    private String email;
    private String name;
    private String role;
    private String profilePic;
    private String phone;
    private boolean isActive;
    private boolean isBlocked;
    private long orderCount;
    private LocalDateTime createdAt;
}
