package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.CategorizationRuleRequest;
import com.scotia.core.dto.CategorizationRuleResponse;
import com.scotia.core.entity.CategorizationRule;
import com.scotia.core.repository.CategorizationRuleRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/rules")
public class CategorizationRuleController {

    private final CategorizationRuleRepository ruleRepository;

    public CategorizationRuleController(CategorizationRuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategorizationRuleResponse>>> getRules(@RequestHeader("X-User-Id") String userIdHeader) {
        UUID userId = UUID.fromString(userIdHeader);
        
        // Get global rules and user-specific rules
        List<CategorizationRule> globalRules = ruleRepository.findByUserIdIsNull();
        List<CategorizationRule> userRules = ruleRepository.findByUserId(userId);
        
        List<CategorizationRule> allRules = globalRules;
        allRules.addAll(userRules);
        
        List<CategorizationRuleResponse> responses = allRules.stream()
                .map(CategorizationRuleResponse::fromEntity)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategorizationRuleResponse>> createRule(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody CategorizationRuleRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        CategorizationRule rule = new CategorizationRule();
        rule.setUserId(userId);
        rule.setKeyword(request.getKeyword());
        rule.setCategoryId(request.getCategoryId());

        CategorizationRule savedRule = ruleRepository.save(rule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(CategorizationRuleResponse.fromEntity(savedRule)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteRule(
            @RequestHeader("X-User-Id") String userIdHeader,
            @PathVariable UUID id) {
        UUID userId = UUID.fromString(userIdHeader);

        CategorizationRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found"));

        // Only allow deleting user's own rules
        if (rule.getUserId() == null || !rule.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot delete global rule or rule does not belong to user", "FORBIDDEN"));
        }

        ruleRepository.delete(rule);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

