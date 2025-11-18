package com.scotia.core.dto;

import com.scotia.core.entity.Account;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AccountResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private Account.AccountType type;
    private BigDecimal currentBalance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AccountResponse fromEntity(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setUserId(account.getUserId());
        response.setName(account.getName());
        response.setType(account.getType());
        response.setCurrentBalance(account.getCurrentBalance());
        response.setCreatedAt(account.getCreatedAt());
        response.setUpdatedAt(account.getUpdatedAt());
        return response;
    }
}

