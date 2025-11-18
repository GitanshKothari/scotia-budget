package com.scotia.core.service;

import com.scotia.core.entity.Budget;
import com.scotia.core.entity.Notification;
import com.scotia.core.entity.SavingsGoal;
import com.scotia.core.entity.Transaction;
import com.scotia.core.repository.BudgetRepository;
import com.scotia.core.repository.NotificationRepository;
import com.scotia.core.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            BudgetRepository budgetRepository,
            TransactionRepository transactionRepository) {
        this.notificationRepository = notificationRepository;
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void checkBudgetThresholds(UUID userId, UUID categoryId, LocalDateTime transactionDate) {
        if (categoryId == null) {
            return;
        }

        YearMonth yearMonth = YearMonth.from(transactionDate);
        LocalDate monthStart = yearMonth.atDay(1);
        LocalDate monthEnd = yearMonth.atEndOfMonth();

        // Get active budgets for this category
        List<Budget> budgets = budgetRepository.findByUserIdAndIsActive(userId, true);
        Budget budget = budgets.stream()
                .filter(b -> b.getCategoryId().equals(categoryId))
                .findFirst()
                .orElse(null);

        if (budget == null) {
            return;
        }

        // Calculate spending for this month
        List<Transaction> transactions = transactionRepository.findWithFilters(
                userId, null, categoryId,
                monthStart.atStartOfDay(),
                monthEnd.atTime(23, 59, 59),
                null, null, null);

        BigDecimal totalSpent = transactions.stream()
                .filter(t -> t.getType() == Transaction.TransactionType.DEBIT)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Check if 80% threshold reached
        BigDecimal threshold = budget.getMonthlyLimit().multiply(new BigDecimal("0.8"));
        if (totalSpent.compareTo(threshold) >= 0) {
            // Check if notification already exists for this month
            List<Notification> existingNotifications = notificationRepository.findByUserId(userId);
            boolean alreadyNotified = existingNotifications.stream()
                    .anyMatch(n -> n.getType() == Notification.NotificationType.BUDGET_THRESHOLD
                            && n.getCreatedAt().getYear() == transactionDate.getYear()
                            && n.getCreatedAt().getMonth() == transactionDate.getMonth()
                            && n.getDataJson() != null && n.getDataJson().contains(categoryId.toString()));

            if (!alreadyNotified) {
                Notification notification = new Notification();
                notification.setUserId(userId);
                notification.setType(Notification.NotificationType.BUDGET_THRESHOLD);
                notification.setTitle("Budget Threshold Reached");
                notification.setMessage(String.format("You've spent %.2f%% of your budget for this category this month.",
                        totalSpent.divide(budget.getMonthlyLimit(), 2, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue()));
                notification.setDataJson("{\"categoryId\":\"" + categoryId + "\",\"month\":\"" + yearMonth + "\"}");
                notificationRepository.save(notification);
            }
        }
    }

    @Transactional
    public void checkGoalCompletion(UUID userId, SavingsGoal goal, boolean wasActive) {
        if (wasActive && goal.getStatus() == SavingsGoal.GoalStatus.COMPLETED) {
            Notification notification = new Notification();
            notification.setUserId(userId);
            notification.setType(Notification.NotificationType.GOAL_REACHED);
            notification.setTitle("Goal Reached!");
            notification.setMessage(String.format("Congratulations! You've reached your goal: %s", goal.getName()));
            notification.setDataJson("{\"goalId\":\"" + goal.getId() + "\"}");
            notificationRepository.save(notification);
        }
    }
}

