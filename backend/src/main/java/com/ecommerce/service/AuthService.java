package com.ecommerce.service;

import com.ecommerce.dto.response.AuthResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.PasswordResetToken;
import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.exception.UnauthorizedException;
import com.ecommerce.repository.PasswordResetTokenRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final OtpService otpService;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void forgotPassword(String email) {
        // Always return success to prevent email enumeration
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getPassword() == null) return; // OAuth-only account, no password to reset
            String token = UUID.randomUUID().toString();
            PasswordResetToken prt = PasswordResetToken.builder()
                .userId(user.getId())
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();
            resetTokenRepository.save(prt);
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordReset(user.getEmail(), resetLink);
        });
    }

    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = resetTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link"));
        if (!prt.isValid()) {
            throw new IllegalArgumentException("This reset link has expired or already been used");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        User user = userRepository.findById(prt.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", prt.getUserId()));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        prt.setUsed(true);
        resetTokenRepository.save(prt);
    }

    public void changePassword(User user, String currentPassword, String newPassword) {
        User dbUser = userRepository.findById(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", user.getId()));
        if (dbUser.getPassword() == null) {
            throw new IllegalArgumentException("Your account uses Google sign-in and has no password to change");
        }
        if (currentPassword == null || !passwordEncoder.matches(currentPassword, dbUser.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }
        dbUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(dbUser);
    }

    /** Step 1 of signup: email a verification code. Rejects already-registered emails early. */
    public String sendRegistrationOtp(String email) {
        if (email == null || !email.contains("@"))
            throw new IllegalArgumentException("Enter a valid email");
        if (userRepository.existsByEmail(email))
            throw new IllegalArgumentException("Email already in use");
        return otpService.sendEmailOtp(email);
    }

    public AuthResponse register(Map<String, String> req, HttpServletResponse response) {
        String email = req.get("email");
        String password = req.get("password");
        String name = req.get("name");

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Email must be verified with the OTP before the account is created
        otpService.verifyEmailOtp(email, req.get("otp"));

        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .name(name != null ? name : email.split("@")[0])
            .phone(req.get("phone"))
            .role(Role.CUSTOMER)
            .isActive(true)
            .build();
        user = userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(email, user.getRole().name(), user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(email);

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    public AuthResponse login(Map<String, String> req, HttpServletResponse response) {
        String email = req.get("email");
        String password = req.get("password");

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.getPassword() == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.isBlocked()) {
            throw new UnauthorizedException("Your account has been blocked");
        }

        String accessToken = tokenProvider.generateAccessToken(email, user.getRole().name(), user.getId());
        String refreshToken = tokenProvider.generateRefreshToken(email);

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    public UserResponse getCurrentUser(User user) {
        return mapToUserResponse(user);
    }

    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            refreshToken = Arrays.stream(request.getCookies())
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst().orElse(null);
        }
        if (refreshToken == null || !tokenProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid or missing refresh token");
        }
        String email = tokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String newAccessToken = tokenProvider.generateAccessToken(email, user.getRole().name(), user.getId());
        return AuthResponse.builder()
            .accessToken(newAccessToken)
            .tokenType("Bearer")
            .user(mapToUserResponse(user))
            .build();
    }

    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .role(user.getRole().name())
            .profilePic(user.getProfilePic())
            .phone(user.getPhone())
            .phoneVerified(user.isPhoneVerified())
            .gender(user.getGender())
            .dob(user.getDob())
            .isActive(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
