package com.scotia.core.seed;

import com.scotia.core.entity.*;
import com.scotia.core.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        // Check if data already exists
        if (userRepository.count() > 0) {
            return; // Data already seeded
        }

        // Create demo user
        User demoUser = new User();
        demoUser.setEmail("demo@example.com");
        demoUser.setPasswordHash(passwordEncoder.encode("Demo123!"));
        demoUser.setName("Demo User");
        demoUser.setThemePreference(User.ThemePreference.SYSTEM);
        demoUser = userRepository.save(demoUser);

        // Create default categories
        List<String> defaultCategoryNames = Arrays.asList(
                "Groceries", "Transport", "Bills", "Shopping", "Entertainment", "Rent", "Salary", "Misc"
        );
        List<Category.CategoryType> defaultCategoryTypes = Arrays.asList(
                Category.CategoryType.EXPENSE, Category.CategoryType.EXPENSE, Category.CategoryType.EXPENSE,
                Category.CategoryType.EXPENSE, Category.CategoryType.EXPENSE, Category.CategoryType.EXPENSE,
                Category.CategoryType.INCOME, Category.CategoryType.EXPENSE
        );

        for (int i = 0; i < defaultCategoryNames.size(); i++) {
            Category category = new Category();
            category.setUser(null); // Default category
            category.setName(defaultCategoryNames.get(i));
            category.setType(defaultCategoryTypes.get(i));
            category.setIsDefault(true);
            categoryRepository.save(category);
        }

        // Get categories for demo user
        List<Category> allCategories = categoryRepository.findAll();
        Category groceriesCategory = allCategories.stream()
                .filter(c -> c.getName().equals("Groceries")).findFirst().orElse(null);
        Category transportCategory = allCategories.stream()
                .filter(c -> c.getName().equals("Transport")).findFirst().orElse(null);
        Category billsCategory = allCategories.stream()
                .filter(c -> c.getName().equals("Bills")).findFirst().orElse(null);
        Category shoppingCategory = allCategories.stream()
                .filter(c -> c.getName().equals("Shopping")).findFirst().orElse(null);
        Category entertainmentCategory = allCategories.stream()
                .filter(c -> c.getName().equals("Entertainment")).findFirst().orElse(null);
        Category salaryCategory = allCategories.stream()
                .filter(c -> c.getName().equals("Salary")).findFirst().orElse(null);

        // Create budgets for demo user
        if (groceriesCategory != null) {
            Budget groceriesBudget = new Budget();
            groceriesBudget.setUser(demoUser);
            groceriesBudget.setCategory(groceriesCategory);
            groceriesBudget.setMonthlyLimit(new BigDecimal("400.00"));
            groceriesBudget.setIsActive(true);
            budgetRepository.save(groceriesBudget);
        }

        if (transportCategory != null) {
            Budget transportBudget = new Budget();
            transportBudget.setUser(demoUser);
            transportBudget.setCategory(transportCategory);
            transportBudget.setMonthlyLimit(new BigDecimal("200.00"));
            transportBudget.setIsActive(true);
            budgetRepository.save(transportBudget);
        }

        if (billsCategory != null) {
            Budget billsBudget = new Budget();
            billsBudget.setUser(demoUser);
            billsBudget.setCategory(billsCategory);
            billsBudget.setMonthlyLimit(new BigDecimal("300.00"));
            billsBudget.setIsActive(true);
            budgetRepository.save(billsBudget);
        }

        if (shoppingCategory != null) {
            Budget shoppingBudget = new Budget();
            shoppingBudget.setUser(demoUser);
            shoppingBudget.setCategory(shoppingCategory);
            shoppingBudget.setMonthlyLimit(new BigDecimal("150.00"));
            shoppingBudget.setIsActive(true);
            budgetRepository.save(shoppingBudget);
        }

        // Create transactions for demo user (current and previous month)
        LocalDateTime now = LocalDateTime.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();
        int previousMonth = currentMonth == 1 ? 12 : currentMonth - 1;
        int previousYear = currentMonth == 1 ? currentYear - 1 : currentYear;

        // Current month transactions
        createTransaction(demoUser, groceriesCategory,
                new BigDecimal("85.50"), "Grocery shopping", "Loblaws",
                LocalDateTime.of(currentYear, currentMonth, 5, 14, 30));

        createTransaction(demoUser, transportCategory,
                new BigDecimal("45.00"), "Uber ride", "Uber",
                LocalDateTime.of(currentYear, currentMonth, 8, 9, 15));

        createTransaction(demoUser, billsCategory,
                new BigDecimal("120.00"), "Electricity bill", "Hydro One",
                LocalDateTime.of(currentYear, currentMonth, 10, 0, 0));

        createTransaction(demoUser, shoppingCategory,
                new BigDecimal("75.25"), "Clothing purchase", "H&M",
                LocalDateTime.of(currentYear, currentMonth, 12, 16, 45));

        createTransaction(demoUser, entertainmentCategory,
                new BigDecimal("35.00"), "Movie tickets", "Cineplex",
                LocalDateTime.of(currentYear, currentMonth, 15, 19, 30));

        createTransaction(demoUser, salaryCategory,
                new BigDecimal("3500.00"), "Monthly salary", "Employer",
                LocalDateTime.of(currentYear, currentMonth, 1, 0, 0));

        // Previous month transactions
        createTransaction(demoUser, groceriesCategory,
                new BigDecimal("92.30"), "Grocery shopping", "Metro",
                LocalDateTime.of(previousYear, previousMonth, 3, 15, 0));

        createTransaction(demoUser, transportCategory,
                new BigDecimal("50.00"), "Gas station", "Shell",
                LocalDateTime.of(previousYear, previousMonth, 7, 8, 0));

        createTransaction(demoUser, billsCategory,
                new BigDecimal("95.00"), "Internet bill", "Rogers",
                LocalDateTime.of(previousYear, previousMonth, 12, 0, 0));

        createTransaction(demoUser, shoppingCategory,
                new BigDecimal("125.00"), "Online purchase", "Amazon",
                LocalDateTime.of(previousYear, previousMonth, 18, 10, 0));

        createTransaction(demoUser, salaryCategory,
                new BigDecimal("3500.00"), "Monthly salary", "Employer",
                LocalDateTime.of(previousYear, previousMonth, 1, 0, 0));
    }

    private void createTransaction(User user, Category category,
                                   BigDecimal amount, String description, String merchantName, LocalDateTime date) {
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transaction.setMerchantName(merchantName);
        transaction.setDate(date);
        transactionRepository.save(transaction);
    }
}

