package com.scotia.core.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BudgetRequest {
    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotNull(message = "Monthly limit is required")
    @Positive(message = "Monthly limit must be positive")
    private BigDecimal monthlyLimit;
}

