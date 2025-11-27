package com.scotia.core.service;

import com.scotia.core.dto.CategoryResponse;
import com.scotia.core.entity.Category;
import com.scotia.core.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getCategories() {
        // Only return default categories (userId = null)
        List<Category> defaultCategories = categoryRepository.findByUserIdIsNull();
        
        return defaultCategories.stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }
}

