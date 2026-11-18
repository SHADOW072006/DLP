package com.intellidlp.user;

import com.intellidlp.auth.UserProfileResponse;
import com.intellidlp.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        List<UserProfileResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", users));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal UserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        String clientIp = getClientIp(httpRequest);
        String adminUsername = currentUser != null ? currentUser.getUsername() : "SYSTEM";
        UserProfileResponse user = userService.createUser(request, adminUsername, clientIp);
        return ResponseEntity.ok(ApiResponse.ok("User created successfully", user));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal UserDetails currentUser,
            HttpServletRequest httpRequest
    ) {
        String clientIp = getClientIp(httpRequest);
        String adminUsername = currentUser != null ? currentUser.getUsername() : "SYSTEM";
        UserProfileResponse updated = userService.updateUserStatus(id, request.getStatus(), adminUsername, clientIp);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", updated));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

