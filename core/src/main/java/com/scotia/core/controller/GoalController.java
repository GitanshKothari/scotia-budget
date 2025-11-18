package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.GoalRequest;
import com.scotia.core.dto.GoalResponse;
import com.scotia.core.dto.UpdateGoalRequest;
import com.scotia.core.entity.SavingsGoal;
import com.scotia.core.repository.SavingsGoalRepository;
import com.scotia.core.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/goals")
public class GoalController {

    private final SavingsGoalRepository goalRepository;
    private final NotificationService notificationService;

    public GoalController(SavingsGoalRepository goalRepository, NotificationService notificationService) {
        this.goalRepository = goalRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals(@RequestHeader("X-User-Id") String userIdHeader) {
        UUID userId = UUID.fromString(userIdHeader);
        List<SavingsGoal> goals = goalRepository.findByUserId(userId);
        List<GoalResponse> responses = goals.stream()
                .map(GoalResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody GoalRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        SavingsGoal goal = new SavingsGoal();
        goal.setUserId(userId);
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setCurrentAmount(request.getCurrentAmount());
        goal.setTargetDate(request.getTargetDate());
        goal.setStatus(SavingsGoal.GoalStatus.ACTIVE);

        // Check if already completed
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(SavingsGoal.GoalStatus.COMPLETED);
        }

        SavingsGoal savedGoal = goalRepository.save(goal);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(GoalResponse.fromEntity(savedGoal)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id,
            @RequestBody UpdateGoalRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        SavingsGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        if (!goal.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Goal does not belong to user", "FORBIDDEN"));
        }

        boolean wasActive = goal.getStatus() == SavingsGoal.GoalStatus.ACTIVE;

        if (request.getName() != null) {
            goal.setName(request.getName());
        }
        if (request.getTargetAmount() != null) {
            goal.setTargetAmount(request.getTargetAmount());
        }
        if (request.getCurrentAmount() != null) {
            goal.setCurrentAmount(request.getCurrentAmount());
        }
        if (request.getTargetDate() != null) {
            goal.setTargetDate(request.getTargetDate());
        }

        // Check if goal should be marked as completed
        if (wasActive && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(SavingsGoal.GoalStatus.COMPLETED);
        }

        SavingsGoal updatedGoal = goalRepository.save(goal);
        
        // Check for goal completion notification
        notificationService.checkGoalCompletion(userId, updatedGoal, wasActive);

        return ResponseEntity.ok(ApiResponse.success(GoalResponse.fromEntity(updatedGoal)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteGoal(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdHeader);

        SavingsGoal goal = goalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Goal not found"));

        if (!goal.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Goal does not belong to user", "FORBIDDEN"));
        }

        goalRepository.delete(goal);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

