package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.TransactionRequest;
import com.scotia.core.dto.TransactionResponse;
import com.scotia.core.dto.UpdateTransactionRequest;
import com.scotia.core.entity.Transaction;
import com.scotia.core.repository.TransactionRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/transactions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        UUID userId = UUID.fromString(userIdHeader);

        List<Transaction> transactions = transactionRepository.findWithFilters(
                userId, categoryId, startDate, endDate);

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

        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setCategoryId(request.getCategoryId());
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setMerchantName(request.getMerchantName());
        transaction.setDate(request.getDate());

        Transaction savedTransaction = transactionRepository.save(transaction);

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
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
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

        transactionRepository.delete(transaction);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

