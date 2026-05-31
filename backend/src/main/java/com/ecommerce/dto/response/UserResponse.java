package com.ecommerce.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private String role;
    private String profilePic;
    private String phone;
    private boolean phoneVerified;
    private String gender;
    private LocalDate dob;
    private boolean isActive;
    private LocalDateTime createdAt;
}
