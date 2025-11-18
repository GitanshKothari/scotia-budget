package com.scotia.core.dto;

import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateBudgetRequest {
    private BigDecimal monthlyLimit;
    private Boolean isActive;
}

