package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.TransactionRequest;
import com.scotia.core.dto.TransactionResponse;
import com.scotia.core.dto.UpdateTransactionRequest;
import com.scotia.core.entity.Account;
import com.scotia.core.entity.Transaction;
import com.scotia.core.repository.AccountRepository;
import com.scotia.core.repository.TransactionRepository;
import com.scotia.core.service.CategorizationService;
import com.scotia.core.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategorizationService categorizationService;
    private final NotificationService notificationService;

    public TransactionController(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository,
            CategorizationService categorizationService,
            NotificationService notificationService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categorizationService = categorizationService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestParam(required = false) UUID accountId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String search) {
        UUID userId = UUID.fromString(userIdHeader);

        List<Transaction> transactions = transactionRepository.findWithFilters(
                userId, accountId, categoryId, startDate, endDate, minAmount, maxAmount, search);

        List<TransactionResponse> responses = transactions.stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody TransactionRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        // Validate account belongs to user
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account does not belong to user", "FORBIDDEN"));
        }

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setAccountId(request.getAccountId());
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setMerchantName(request.getMerchantName());
        transaction.setDate(request.getDate());

        // Apply categorization rules if categoryId is null
        UUID categoryId = request.getCategoryId();
        if (categoryId == null) {
            categoryId = categorizationService.applyCategorizationRules(
                    request.getMerchantName(), request.getDescription(), userId);
        }
        transaction.setCategoryId(categoryId);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Update account balance
        BigDecimal balanceChange = request.getType() == Transaction.TransactionType.DEBIT
                ? request.getAmount().negate()
                : request.getAmount();
        account.setCurrentBalance(account.getCurrentBalance().add(balanceChange));
        accountRepository.save(account);

        // Check budget thresholds for notifications (only for DEBIT transactions)
        if (request.getType() == Transaction.TransactionType.DEBIT && categoryId != null) {
            notificationService.checkBudgetThresholds(userId, categoryId, request.getDate());
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(TransactionResponse.fromEntity(savedTransaction)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id,
            @RequestBody UpdateTransactionRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!transaction.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Transaction does not belong to user", "FORBIDDEN"));
        }

        if (request.getCategoryId() != null) {
            transaction.setCategoryId(request.getCategoryId());
        }
        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getMerchantName() != null) {
            transaction.setMerchantName(request.getMerchantName());
        }
        if (request.getDate() != null) {
            transaction.setDate(request.getDate());
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return ResponseEntity.ok(ApiResponse.success(TransactionResponse.fromEntity(updatedTransaction)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteTransaction(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdHeader);

        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        if (!transaction.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Transaction does not belong to user", "FORBIDDEN"));
        }

        // Reverse account balance adjustment
        Account account = accountRepository.findById(transaction.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        BigDecimal balanceChange = transaction.getType() == Transaction.TransactionType.DEBIT
                ? transaction.getAmount() // Reverse debit: add back
                : transaction.getAmount().negate(); // Reverse credit: subtract

        account.setCurrentBalance(account.getCurrentBalance().add(balanceChange));
        accountRepository.save(account);

        transactionRepository.delete(transaction);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

