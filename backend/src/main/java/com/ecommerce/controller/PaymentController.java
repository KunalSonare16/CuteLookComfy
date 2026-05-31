package com.ecommerce.controller;

import com.ecommerce.dto.request.InitiatePaymentRequest;
import com.ecommerce.dto.request.VerifyPaymentRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiate(@AuthenticationPrincipal User user,
                                                                   @Valid @RequestBody InitiatePaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.initiatePayment(req.getOrderId(), user.getId())));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verify(@AuthenticationPrincipal User user,
                                                                     @Valid @RequestBody VerifyPaymentRequest req) {
        Map<String, Object> result = paymentService.verifyPayment(
            req.getRazorpayOrderId(), req.getRazorpayPaymentId(), req.getRazorpaySignature());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody String payload,
                                           @RequestHeader("X-Razorpay-Signature") String signature) {
        paymentService.handleWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }
}
