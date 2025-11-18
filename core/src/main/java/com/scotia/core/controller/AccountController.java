package com.scotia.core.controller;

import com.scotia.core.dto.AccountRequest;
import com.scotia.core.dto.AccountResponse;
import com.scotia.core.dto.ApiResponse;
import com.scotia.core.entity.Account;
import com.scotia.core.repository.AccountRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/accounts")
public class AccountController {

    private final AccountRepository accountRepository;

    public AccountController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccounts(@RequestHeader("X-User-Id") String userIdHeader) {
        UUID userId = UUID.fromString(userIdHeader);
        List<Account> accounts = accountRepository.findByUserId(userId);
        List<AccountResponse> responses = accounts.stream()
                .map(AccountResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody AccountRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        Account account = new Account();
        account.setUserId(userId);
        account.setName(request.getName());
        account.setType(request.getType());
        account.setCurrentBalance(request.getCurrentBalance());

        Account savedAccount = accountRepository.save(account);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AccountResponse.fromEntity(savedAccount)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<AccountResponse>> updateAccount(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id,
            @RequestBody AccountRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account does not belong to user", "FORBIDDEN"));
        }

        if (request.getName() != null) {
            account.setName(request.getName());
        }
        if (request.getType() != null) {
            account.setType(request.getType());
        }
        if (request.getCurrentBalance() != null) {
            account.setCurrentBalance(request.getCurrentBalance());
        }

        Account updatedAccount = accountRepository.save(account);
        return ResponseEntity.ok(ApiResponse.success(AccountResponse.fromEntity(updatedAccount)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteAccount(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdHeader);

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account does not belong to user", "FORBIDDEN"));
        }

        accountRepository.delete(account);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

