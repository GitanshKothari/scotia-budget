package com.scotia.core.dto;

import com.scotia.core.entity.SavingsGoal;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class GoalResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private LocalDate targetDate;
    private SavingsGoal.GoalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static GoalResponse fromEntity(SavingsGoal goal) {
        GoalResponse response = new GoalResponse();
        response.setId(goal.getId());
        response.setUserId(goal.getUserId());
        response.setName(goal.getName());
        response.setTargetAmount(goal.getTargetAmount());
        response.setCurrentAmount(goal.getCurrentAmount());
        response.setTargetDate(goal.getTargetDate());
        response.setStatus(goal.getStatus());
        response.setCreatedAt(goal.getCreatedAt());
        response.setUpdatedAt(goal.getUpdatedAt());
        return response;
    }
}

