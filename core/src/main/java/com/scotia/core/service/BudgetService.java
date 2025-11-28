package com.scotia.core.service;

import com.scotia.core.dto.BudgetRequest;
import com.scotia.core.dto.BudgetResponse;
import com.scotia.core.dto.UpdateBudgetRequest;
import com.scotia.core.entity.Budget;
import com.scotia.core.entity.Category;
import com.scotia.core.entity.User;
import com.scotia.core.repository.BudgetRepository;
import com.scotia.core.repository.CategoryRepository;
import com.scotia.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<BudgetResponse> getBudgets(UUID userId) {
        List<Budget> budgets = budgetRepository.findByUser_Id(userId);
        return budgets.stream()
                .map(BudgetResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public BudgetResponse createBudget(UUID userId, BudgetRequest request) {
        User user = userRepository.getReferenceById(userId);
        Category category = categoryRepository.getReferenceById(request.getCategoryId());
        
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonthlyLimit(request.getMonthlyLimit());
        budget.setIsActive(true);

        Budget savedBudget = budgetRepository.save(budget);
        return BudgetResponse.fromEntity(savedBudget);
    }

    public BudgetResponse updateBudget(UUID userId, UUID id, UpdateBudgetRequest request) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));

        if (!budget.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Budget does not belong to user");
        }

        if (request.getMonthlyLimit() != null) {
            budget.setMonthlyLimit(request.getMonthlyLimit());
        }
        if (request.getIsActive() != null) {
            budget.setIsActive(request.getIsActive());
        }

        Budget updatedBudget = budgetRepository.save(budget);
        return BudgetResponse.fromEntity(updatedBudget);
    }

    public void deleteBudget(UUID userId, UUID id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));

        if (!budget.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Budget does not belong to user");
        }

        budgetRepository.delete(budget);
    }
}

