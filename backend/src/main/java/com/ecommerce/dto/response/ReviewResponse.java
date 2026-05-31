package com.ecommerce.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String userName;
    private String userProfilePic;
    private Integer rating;
    private String title;
    private String comment;
    private boolean isVerifiedPurchase;
    private boolean isApproved;
    private Integer helpfulCount;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
}
