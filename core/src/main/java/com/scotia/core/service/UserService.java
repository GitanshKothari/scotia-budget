package com.scotia.core.service;

import com.scotia.core.dto.UpdateUserRequest;
import com.scotia.core.dto.UserResponse;
import com.scotia.core.entity.User;
import com.scotia.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserResponse.fromEntity(user);
    }

    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getThemePreference() != null) {
            if (request.getThemePreference() != User.ThemePreference.LIGHT &&
                request.getThemePreference() != User.ThemePreference.DARK &&
                request.getThemePreference() != User.ThemePreference.SYSTEM) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid theme preference");
            }
            user.setThemePreference(request.getThemePreference());
        }

        User updatedUser = userRepository.save(user);
        return UserResponse.fromEntity(updatedUser);
    }
}

