package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.CategoryResponse;
import com.scotia.core.entity.Category;
import com.scotia.core.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
        // Only return default categories (userId = null)
        List<Category> defaultCategories = categoryRepository.findByUserIdIsNull();
        
        List<CategoryResponse> responses = defaultCategories.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}

