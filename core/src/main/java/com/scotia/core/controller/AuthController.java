package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.RegisterRequest;
import com.scotia.core.dto.UserResponse;
import com.scotia.core.dto.VerifyRequest;
import com.scotia.core.entity.User;
import com.scotia.core.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/core/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Email already in use", "EMAIL_EXISTS"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setThemePreference(User.ThemePreference.SYSTEM);

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(savedUser)));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<UserResponse>> verify(@Valid @RequestBody VerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid credentials", "INVALID_CREDENTIALS"));
        }

        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user)));
    }
}

