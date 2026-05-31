package com.ecommerce.controller;

import com.ecommerce.dto.request.CreateReviewRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/api/products/{id}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
        @PathVariable UUID id,
        @AuthenticationPrincipal User user,
        @Valid @RequestBody CreateReviewRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(reviewService.createReview(id, user, req)));
    }

    @PutMapping("/api/reviews/{id}/helpful")
    public ResponseEntity<ApiResponse<Void>> markHelpful(@PathVariable Long id) {
        reviewService.markHelpful(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as helpful"));
    }
}
