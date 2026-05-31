package com.ecommerce.controller;

import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @Value("${spring.mail.username:support@cutelookcomfy.com}")
    private String supportInbox;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> submit(@RequestBody Map<String, String> req) {
        String name = req.getOrDefault("name", "");
        String email = req.getOrDefault("email", "");
        String subject = req.getOrDefault("subject", "(no subject)");
        String message = req.getOrDefault("message", "");

        if (email.isBlank() || message.isBlank()) {
            throw new IllegalArgumentException("Email and message are required");
        }

        emailService.sendContactMessage(supportInbox, name, email, subject, message);
        return ResponseEntity.ok(ApiResponse.success("Message received. We'll be in touch soon."));
    }
}
