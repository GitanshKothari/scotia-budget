package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.BudgetRequest;
import com.scotia.core.dto.BudgetResponse;
import com.scotia.core.dto.UpdateBudgetRequest;
import com.scotia.core.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/core/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BudgetResponse>>> getBudgets(@RequestHeader("X-User-Id") String userIdHeader) {
        UUID userId = UUID.fromString(userIdHeader);
        List<BudgetResponse> responses = budgetService.getBudgets(userId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BudgetResponse>> createBudget(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody BudgetRequest request) {
        UUID userId = UUID.fromString(userIdHeader);
        BudgetResponse response = budgetService.createBudget(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BudgetResponse>> updateBudget(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id,
            @RequestBody UpdateBudgetRequest request) {
        try {
            UUID userId = UUID.fromString(userIdHeader);
            BudgetResponse response = budgetService.updateBudget(userId, id, request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "FORBIDDEN"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteBudget(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        try {
            UUID userId = UUID.fromString(userIdHeader);
            budgetService.deleteBudget(userId, id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "FORBIDDEN"));
        }
    }
}

