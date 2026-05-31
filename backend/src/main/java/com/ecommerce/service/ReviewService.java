package com.ecommerce.service;

import com.ecommerce.dto.request.CreateReviewRequest;
import com.ecommerce.dto.response.PagedResponse;
import com.ecommerce.dto.response.ReviewResponse;
import com.ecommerce.entity.*;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.repository.*;
import com.ecommerce.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getProductReviews(UUID productId, int page, int size) {
        return PaginationUtils.toPagedResponse(
            reviewRepository.findByProductIdAndIsApprovedTrue(productId, PageRequest.of(page, size,
                Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toResponse));
    }

    @Transactional
    public ReviewResponse createReview(UUID productId, User user, CreateReviewRequest req) {
        Product product = productRepository.findByIdAndDeletedAtIsNull(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // Only customers who actually bought (and paid for) the product can review it
        if (!orderItemRepository.hasPurchased(user.getId(), productId))
            throw new IllegalArgumentException("You can only review products you've purchased");

        if (reviewRepository.existsByProductIdAndUserId(productId, user.getId()))
            throw new IllegalArgumentException("You have already reviewed this product");

        Review review = Review.builder()
            .product(product).user(user)
            .rating(req.getRating()).title(req.getTitle())
            .comment(req.getComment()).isVerifiedPurchase(true)
            .isApproved(false).helpfulCount(0).build();

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void markHelpful(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
    }

    @Transactional
    public void approveReview(Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        review.setApproved(true);
        reviewRepository.save(review);
    }

    @Transactional
    public void rejectReview(Long id) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        review.setApproved(false);
        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getAdminReviews(Boolean approved, int page, int size) {
        return PaginationUtils.toPagedResponse(
            reviewRepository.findAllAdmin(approved, PageRequest.of(page, size))
                .map(this::toResponse));
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
            .id(r.getId())
            .userName(r.getUser().getName())
            .userProfilePic(r.getUser().getProfilePic())
            .rating(r.getRating()).title(r.getTitle()).comment(r.getComment())
            .isVerifiedPurchase(r.isVerifiedPurchase()).isApproved(r.isApproved())
            .helpfulCount(r.getHelpfulCount())
            .imageUrls(r.getImages().stream().map(ReviewImage::getImageUrl).collect(Collectors.toList()))
            .createdAt(r.getCreatedAt()).build();
    }
}
