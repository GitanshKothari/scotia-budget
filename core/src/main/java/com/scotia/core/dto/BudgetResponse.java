package com.scotia.core.dto;

import com.scotia.core.entity.Budget;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BudgetResponse {
    private UUID id;
    private UUID userId;
    private UUID categoryId;
    private BigDecimal monthlyLimit;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BudgetResponse fromEntity(Budget budget) {
        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setUserId(budget.getUserId());
        response.setCategoryId(budget.getCategoryId());
        response.setMonthlyLimit(budget.getMonthlyLimit());
        response.setIsActive(budget.getIsActive());
        response.setCreatedAt(budget.getCreatedAt());
        response.setUpdatedAt(budget.getUpdatedAt());
        return response;
    }
}

