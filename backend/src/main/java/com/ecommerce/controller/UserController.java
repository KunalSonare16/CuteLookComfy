package com.ecommerce.controller;

import com.ecommerce.dto.request.AddAddressRequest;
import com.ecommerce.dto.request.UpdateProfileRequest;
import com.ecommerce.dto.response.ApiResponse;
import com.ecommerce.dto.response.UserResponse;
import com.ecommerce.entity.Address;
import com.ecommerce.entity.User;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(user, new UpdateProfileRequest())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@AuthenticationPrincipal User user,
                                                                     @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(user, req)));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAddresses(user.getId())));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<Address>> addAddress(@AuthenticationPrincipal User user,
                                                            @RequestBody AddAddressRequest req) {
        return ResponseEntity.ok(ApiResponse.success(userService.addAddress(user, req)));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Address>> updateAddress(@AuthenticationPrincipal User user,
                                                               @PathVariable Long id,
                                                               @RequestBody AddAddressRequest req) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateAddress(id, user.getId(), req)));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@AuthenticationPrincipal User user, @PathVariable Long id) {
        userService.deleteAddress(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Address deleted"));
    }

    @PutMapping("/addresses/{id}/default")
    public ResponseEntity<ApiResponse<Void>> setDefault(@AuthenticationPrincipal User user, @PathVariable Long id) {
        userService.setDefaultAddress(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Default address updated"));
    }
}
