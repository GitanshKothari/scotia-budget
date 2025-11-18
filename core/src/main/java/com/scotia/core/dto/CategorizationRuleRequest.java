package com.scotia.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CategorizationRuleRequest {
    @NotBlank(message = "Keyword is required")
    private String keyword;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;
}

