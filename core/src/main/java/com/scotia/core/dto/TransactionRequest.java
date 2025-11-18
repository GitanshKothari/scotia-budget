package com.scotia.core.dto;

import com.scotia.core.entity.Transaction;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TransactionRequest {
    @NotNull(message = "Account ID is required")
    private UUID accountId;

    private UUID categoryId; // nullable

    @NotNull(message = "Type is required")
    private Transaction.TransactionType type;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Merchant name is required")
    private String merchantName;

    @NotNull(message = "Date is required")
    private LocalDateTime date;
}

