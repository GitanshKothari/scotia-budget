package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.TransactionRequest;
import com.scotia.core.dto.TransactionResponse;
import com.scotia.core.dto.UpdateTransactionRequest;
import com.scotia.core.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/core/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getTransactions(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        UUID userId = UUID.fromString(userIdHeader);
        List<TransactionResponse> responses = transactionService.getTransactions(userId, categoryId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> createTransaction(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody TransactionRequest request) {
        UUID userId = UUID.fromString(userIdHeader);
        TransactionResponse response = transactionService.createTransaction(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionResponse>> updateTransaction(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id,
            @RequestBody UpdateTransactionRequest request) {
        try {
            UUID userId = UUID.fromString(userIdHeader);
            TransactionResponse response = transactionService.updateTransaction(userId, id, request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "FORBIDDEN"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteTransaction(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        try {
            UUID userId = UUID.fromString(userIdHeader);
            transactionService.deleteTransaction(userId, id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .body(ApiResponse.error(e.getReason(), "FORBIDDEN"));
        }
    }
}

