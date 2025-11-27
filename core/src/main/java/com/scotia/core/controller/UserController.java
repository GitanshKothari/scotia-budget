package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.UpdateUserRequest;
import com.scotia.core.dto.UserResponse;
import com.scotia.core.entity.User;
import com.scotia.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/core/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(user)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getThemePreference() != null) {
            if (request.getThemePreference() != User.ThemePreference.LIGHT &&
                request.getThemePreference() != User.ThemePreference.DARK &&
                request.getThemePreference() != User.ThemePreference.SYSTEM) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid theme preference", "INVALID_THEME"));
            }
            user.setThemePreference(request.getThemePreference());
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(UserResponse.fromEntity(updatedUser)));
    }
}

