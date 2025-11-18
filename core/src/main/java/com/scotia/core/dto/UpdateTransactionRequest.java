package com.scotia.core.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UpdateTransactionRequest {
    private UUID categoryId;
    private String description;
    private String merchantName;
    private LocalDateTime date;
}

