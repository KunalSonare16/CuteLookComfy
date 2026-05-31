package com.ecommerce.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateReviewRequest {
    @NotNull @Min(1) @Max(5)
    private Integer rating;
    private String title;
    @NotBlank(message = "Review comment is required")
    private String comment;
}
