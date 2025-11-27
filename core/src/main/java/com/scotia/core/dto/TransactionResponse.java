package com.scotia.core.dto;

import com.scotia.core.entity.Transaction;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TransactionResponse {
    private UUID id;
    private UUID userId;
    private UUID categoryId;
    private BigDecimal amount;
    private String description;
    private String merchantName;
    private LocalDateTime date;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TransactionResponse fromEntity(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setUserId(transaction.getUserId());
        response.setCategoryId(transaction.getCategoryId());
        response.setAmount(transaction.getAmount());
        response.setDescription(transaction.getDescription());
        response.setMerchantName(transaction.getMerchantName());
        response.setDate(transaction.getDate());
        response.setCreatedAt(transaction.getCreatedAt());
        response.setUpdatedAt(transaction.getUpdatedAt());
        return response;
    }
}

