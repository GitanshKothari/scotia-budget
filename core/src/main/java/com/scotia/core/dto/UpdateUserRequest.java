package com.scotia.core.dto;

import com.scotia.core.entity.User;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String name;
    private String preferredCurrency;
    private User.ThemePreference themePreference;
}

