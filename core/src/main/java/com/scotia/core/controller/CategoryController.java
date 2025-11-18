package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.CategoryRequest;
import com.scotia.core.dto.CategoryResponse;
import com.scotia.core.entity.Category;
import com.scotia.core.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(@RequestHeader("X-User-Id") String userIdHeader) {
        UUID userId = UUID.fromString(userIdHeader);
        
        // Get default categories (userId = null) and user custom categories
        List<Category> defaultCategories = categoryRepository.findByUserIdIsNull();
        List<Category> userCategories = categoryRepository.findByUserId(userId);
        
        // Merge lists
        List<Category> allCategories = defaultCategories;
        allCategories.addAll(userCategories);
        
        List<CategoryResponse> responses = allCategories.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody CategoryRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        Category category = new Category();
        category.setUserId(userId);
        category.setName(request.getName());
        category.setType(request.getType());
        category.setIsDefault(false);

        Category savedCategory = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(CategoryResponse.fromEntity(savedCategory)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id,
            @RequestBody CategoryRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Only allow updating user's own categories
        if (category.getUserId() == null || !category.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot update default category", "FORBIDDEN"));
        }

        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getType() != null) {
            category.setType(request.getType());
        }

        Category updatedCategory = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success(CategoryResponse.fromEntity(updatedCategory)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteCategory(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdHeader);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Prevent deletion of default categories
        if (category.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot delete default category", "FORBIDDEN"));
        }

        // Only allow deleting user's own categories
        if (!category.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Category does not belong to user", "FORBIDDEN"));
        }

        categoryRepository.delete(category);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

