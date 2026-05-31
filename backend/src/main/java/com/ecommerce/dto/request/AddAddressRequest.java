package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AddAddressRequest {
    @NotBlank private String name;
    @NotBlank private String phone;
    @NotBlank private String line1;
    private String line2;
    @NotBlank private String city;
    @NotBlank private String state;
    @NotBlank private String pincode;
    private String addressType = "HOME";
    private boolean isDefault = false;
}
