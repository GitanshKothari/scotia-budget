package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.CategoryResponse;
import com.scotia.core.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/core/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(@RequestHeader("X-User-Id") String userIdHeader) {
        List<CategoryResponse> responses = categoryService.getCategories();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}

