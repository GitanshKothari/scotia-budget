package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.UpdateUserRequest;
import com.scotia.core.dto.UserResponse;
import com.scotia.core.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/core/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable UUID id) {
        try {
            UserResponse userResponse = userService.getUser(id);
            return ResponseEntity.ok(ApiResponse.success(userResponse));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "USER_NOT_FOUND"));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        try {
            UserResponse userResponse = userService.updateUser(id, request);
            return ResponseEntity.ok(ApiResponse.success(userResponse));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "INVALID_THEME"));
        }
    }
}

