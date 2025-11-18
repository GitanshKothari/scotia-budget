package com.scotia.core.dto;

import com.scotia.core.entity.Account;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private Account.AccountType type;

    @NotNull(message = "Current balance is required")
    @Positive(message = "Current balance must be positive")
    private BigDecimal currentBalance;
}

