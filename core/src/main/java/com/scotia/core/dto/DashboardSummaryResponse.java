package com.scotia.core.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class DashboardSummaryResponse {
    private List<SpendingByCategory> spendingByCategory;
    private List<DailySpending> dailySpending;
    private List<BudgetSummary> budgets;
    private BigDecimal safeToSpend;

    @Data
    public static class SpendingByCategory {
        private UUID categoryId;
        private String categoryName;
        private BigDecimal amount;
        private BigDecimal budgetLimit;
    }

    @Data
    public static class DailySpending {
        private LocalDate date;
        private BigDecimal amount;
    }

    @Data
    public static class BudgetSummary {
        private UUID categoryId;
        private String categoryName;
        private BigDecimal monthlyLimit;
        private BigDecimal spent;
    }
}

