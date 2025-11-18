package com.scotia.core.dto;

import com.scotia.core.entity.User;
import lombok.Data;

import java.util.UUID;

@Data
public class UserResponse {
    private UUID id;
    private String email;
    private String name;
    private User.UserRole role;
    private String preferredCurrency;
    private User.ThemePreference themePreference;

    public static UserResponse fromEntity(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        response.setPreferredCurrency(user.getPreferredCurrency());
        response.setThemePreference(user.getThemePreference());
        return response;
    }
}

