package com.ecommerce.service;

import com.ecommerce.entity.OtpCode;
import com.ecommerce.repository.OtpCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpCodeRepository otpRepository;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    @Value("${spring.mail.username:}")
    private String mailUsername;

    private boolean isMailConfigured() {
        return mailUsername != null && !mailUsername.isBlank()
            && !mailUsername.equalsIgnoreCase("your-email@gmail.com");
    }

    /** Generates an OTP for an email and sends it. Returns the code only when mail isn't configured (dev). */
    @Transactional
    public String sendEmailOtp(String email) {
        if (email == null || !email.contains("@"))
            throw new IllegalArgumentException("Enter a valid email");

        String code = String.format("%06d", random.nextInt(1_000_000));
        OtpCode otp = OtpCode.builder()
            .identifier(email.toLowerCase())
            .code(code)
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .verified(false)
            .attempts(0)
            .build();
        otpRepository.save(otp);

        if (isMailConfigured()) {
            emailService.sendOtp(email, code);
            return null;
        }
        return code; // dev fallback
    }

    /** Validates the OTP for an email. Throws if invalid/expired. Marks it used on success. */
    @Transactional
    public void verifyEmailOtp(String email, String code) {
        if (code == null || code.isBlank())
            throw new IllegalArgumentException("Enter the verification code sent to your email");
        OtpCode otp = otpRepository.findTopByIdentifierOrderByCreatedAtDesc(email.toLowerCase())
            .orElseThrow(() -> new IllegalArgumentException("Please request a verification code first"));
        if (!otp.isUsable())
            throw new IllegalArgumentException("Code expired or too many attempts. Request a new one.");
        otp.setAttempts(otp.getAttempts() + 1);
        if (!otp.getCode().equals(code)) {
            otpRepository.save(otp);
            throw new IllegalArgumentException("Incorrect verification code");
        }
        otp.setVerified(true);
        otpRepository.save(otp);
    }
}
