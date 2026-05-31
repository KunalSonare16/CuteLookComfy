package com.ecommerce.controller;

import com.ecommerce.dto.response.*;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserResponse>>> getAll(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String role,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAdminUsers(search, role, page, size)));
    }

    @PatchMapping("/{id}/block")
    public ResponseEntity<ApiResponse<Void>> toggleBlock(@PathVariable UUID id) {
        userService.toggleBlock(id);
        return ResponseEntity.ok(ApiResponse.success("User block status toggled"));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<Void>> changeRole(@PathVariable UUID id,
                                                         @RequestBody Map<String, String> body) {
        userService.changeRole(id, body.get("role"));
        return ResponseEntity.ok(ApiResponse.success("Role updated"));
    }
}
