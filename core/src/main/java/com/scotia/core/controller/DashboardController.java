package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.DashboardSummaryResponse;
import com.scotia.core.entity.*;
import com.scotia.core.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/dashboard")
public class DashboardController {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final SavingsGoalRepository goalRepository;

    public DashboardController(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            BudgetRepository budgetRepository,
            CategoryRepository categoryRepository,
            SavingsGoalRepository goalRepository) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.goalRepository = goalRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestParam String month) {
        UUID userId = UUID.fromString(userIdHeader);

        // Parse month (YYYYMM format)
        YearMonth yearMonth = YearMonth.parse(month, java.time.format.DateTimeFormatter.ofPattern("yyyyMM"));
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();
        LocalDateTime startDateTime = monthStart.atStartOfDay();
        LocalDateTime endDateTime = monthEnd.atTime(23, 59, 59);

        DashboardSummaryResponse response = new DashboardSummaryResponse();

        // Accounts
        List<Account> accounts = accountRepository.findByUserId(userId);
        response.setAccounts(accounts.stream().map(acc -> {
            DashboardSummaryResponse.AccountSummary summary = new DashboardSummaryResponse.AccountSummary();
            summary.setId(acc.getId());
            summary.setName(acc.getName());
            summary.setType(acc.getType().name());
            summary.setCurrentBalance(acc.getCurrentBalance());
            return summary;
        }).collect(Collectors.toList()));

        // Get all categories
        List<Category> allCategories = new ArrayList<>(categoryRepository.findByUserIdIsNull());
        allCategories.addAll(categoryRepository.findByUserId(userId));
        Map<UUID, String> categoryMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        // Get transactions for the month
        List<Transaction> transactions = transactionRepository.findWithFilters(
                userId, null, null, startDateTime, endDateTime, null, null, null);

        // Spending by category
        Map<UUID, BigDecimal> spendingByCategoryId = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.DEBIT && t.getCategoryId() != null)
                .collect(Collectors.groupingBy(
                        Transaction::getCategoryId,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<DashboardSummaryResponse.SpendingByCategory> spendingByCategory = new ArrayList<>();
        for (Map.Entry<UUID, BigDecimal> entry : spendingByCategoryId.entrySet()) {
            DashboardSummaryResponse.SpendingByCategory item = new DashboardSummaryResponse.SpendingByCategory();
            item.setCategoryId(entry.getKey());
            item.setCategoryName(categoryMap.getOrDefault(entry.getKey(), "Unknown"));
            item.setAmount(entry.getValue());
            item.setBudgetLimit(BigDecimal.ZERO); // Will be set from budgets
            spendingByCategory.add(item);
        }

        // Daily spending
        Map<LocalDate, BigDecimal> dailySpendingMap = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.DEBIT)
                .collect(Collectors.groupingBy(
                        t -> t.getDate().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        List<DashboardSummaryResponse.DailySpending> dailySpending = dailySpendingMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    DashboardSummaryResponse.DailySpending item = new DashboardSummaryResponse.DailySpending();
                    item.setDate(entry.getKey());
                    item.setAmount(entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        // Budgets with spent amounts
        List<Budget> budgets = budgetRepository.findByUserIdAndIsActive(userId, true);
        List<DashboardSummaryResponse.BudgetSummary> budgetSummaries = new ArrayList<>();
        BigDecimal totalBudgetLimit = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;

        for (Budget budget : budgets) {
            Category category = allCategories.stream()
                    .filter(c -> c.getId().equals(budget.getCategoryId()))
                    .findFirst()
                    .orElse(null);

            if (category != null && category.getType() == Category.CategoryType.EXPENSE) {
                BigDecimal spent = spendingByCategoryId.getOrDefault(budget.getCategoryId(), BigDecimal.ZERO);
                totalBudgetLimit = totalBudgetLimit.add(budget.getMonthlyLimit());
                totalSpent = totalSpent.add(spent);

                DashboardSummaryResponse.BudgetSummary summary = new DashboardSummaryResponse.BudgetSummary();
                summary.setCategoryId(budget.getCategoryId());
                summary.setCategoryName(category.getName());
                summary.setMonthlyLimit(budget.getMonthlyLimit());
                summary.setSpent(spent);
                budgetSummaries.add(summary);

                // Update spendingByCategory with budget limit
                spendingByCategory.stream()
                        .filter(s -> s.getCategoryId().equals(budget.getCategoryId()))
                        .forEach(s -> s.setBudgetLimit(budget.getMonthlyLimit()));
            }
        }

        response.setBudgets(budgetSummaries);
        response.setSpendingByCategory(spendingByCategory);

        // Safe to spend
        BigDecimal safeToSpend = totalBudgetLimit.subtract(totalSpent);
        if (safeToSpend.compareTo(BigDecimal.ZERO) < 0) {
            safeToSpend = BigDecimal.ZERO;
        }
        response.setSafeToSpend(safeToSpend);

        // Goals
        List<SavingsGoal> goals = goalRepository.findByUserId(userId);
        response.setGoals(goals.stream().map(goal -> {
            DashboardSummaryResponse.GoalSummary summary = new DashboardSummaryResponse.GoalSummary();
            summary.setId(goal.getId());
            summary.setName(goal.getName());
            summary.setTargetAmount(goal.getTargetAmount());
            summary.setCurrentAmount(goal.getCurrentAmount());
            summary.setStatus(goal.getStatus().name());
            
            double progress = goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                    ? goal.getCurrentAmount().divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100")).doubleValue()
                    : 0.0;
            summary.setProgressPercent(progress);
            return summary;
        }).collect(Collectors.toList()));

        response.setDailySpending(dailySpending);

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

