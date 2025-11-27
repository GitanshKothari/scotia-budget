package com.scotia.core.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UpdateTransactionRequest {
    private UUID categoryId;
    private BigDecimal amount;
    private String description;
    private String merchantName;
    private LocalDateTime date;
}

