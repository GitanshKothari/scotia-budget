package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.RegisterRequest;
import com.scotia.core.dto.UserResponse;
import com.scotia.core.dto.VerifyRequest;
import com.scotia.core.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/core/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserResponse userResponse = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success(userResponse));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "EMAIL_EXISTS"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<UserResponse>> verify(@Valid @RequestBody VerifyRequest request) {
        try {
            UserResponse userResponse = authService.verify(request);
            return ResponseEntity.ok(ApiResponse.success(userResponse));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "INVALID_CREDENTIALS"));
        }
    }
}

