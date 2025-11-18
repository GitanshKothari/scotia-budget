package com.scotia.core.dto;

import com.scotia.core.entity.CategorizationRule;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CategorizationRuleResponse {
    private UUID id;
    private UUID userId;
    private String keyword;
    private UUID categoryId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CategorizationRuleResponse fromEntity(CategorizationRule rule) {
        CategorizationRuleResponse response = new CategorizationRuleResponse();
        response.setId(rule.getId());
        response.setUserId(rule.getUserId());
        response.setKeyword(rule.getKeyword());
        response.setCategoryId(rule.getCategoryId());
        response.setCreatedAt(rule.getCreatedAt());
        response.setUpdatedAt(rule.getUpdatedAt());
        return response;
    }
}

