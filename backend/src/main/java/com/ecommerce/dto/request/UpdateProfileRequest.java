package com.ecommerce.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String gender;
    private LocalDate dob;
}
