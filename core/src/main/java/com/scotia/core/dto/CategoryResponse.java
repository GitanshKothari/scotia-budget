package com.scotia.core.dto;

import com.scotia.core.entity.Category;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CategoryResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private Category.CategoryType type;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CategoryResponse fromEntity(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setUserId(category.getUserId());
        response.setName(category.getName());
        response.setType(category.getType());
        response.setIsDefault(category.getIsDefault());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }
}

