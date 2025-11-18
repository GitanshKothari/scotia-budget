package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.BudgetRequest;
import com.scotia.core.dto.BudgetResponse;
import com.scotia.core.dto.UpdateBudgetRequest;
import com.scotia.core.entity.Budget;
import com.scotia.core.repository.BudgetRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;

    public BudgetController(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(@RequestHeader("X-User-Id") String userIdHeader) {
        UUID userId = UUID.fromString(userIdHeader);
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        List<BudgetResponse> responses = budgets.stream()
                .map(BudgetResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody BudgetRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        Budget budget = new Budget();
        budget.setUserId(userId);
        budget.setCategoryId(request.getCategoryId());
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setIsActive(true);

        Budget savedBudget = budgetRepository.save(budget);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(BudgetResponse.fromEntity(savedBudget)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id,
            @RequestBody UpdateBudgetRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        if (!budget.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Budget does not belong to user", "FORBIDDEN"));
        }

        if (request.getMonthlyLimit() != null) {
            budget.setMonthlyLimit(request.getMonthlyLimit());
        }
        if (request.getIsActive() != null) {
            budget.setIsActive(request.getIsActive());
        }

        Budget updatedBudget = budgetRepository.save(budget);
        return ResponseEntity.ok(ApiResponse.success(BudgetResponse.fromEntity(updatedBudget)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteBudget(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdHeader);

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        if (!budget.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Budget does not belong to user", "FORBIDDEN"));
        }

        budgetRepository.delete(budget);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

