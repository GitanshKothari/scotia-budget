package com.scotia.core.service;

import com.scotia.core.entity.CategorizationRule;
import com.scotia.core.repository.CategorizationRuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategorizationService {

    private final CategorizationRuleRepository ruleRepository;

    public CategorizationService(CategorizationRuleRepository ruleRepository) {
        this.ruleRepository = ruleRepository;
    }

    public UUID applyCategorizationRules(String merchantName, String description, UUID userId) {
        String searchText = (merchantName + " " + description).toLowerCase();

        // First check user-specific rules
        List<CategorizationRule> userRules = ruleRepository.findByUserId(userId);
        for (CategorizationRule rule : userRules) {
            if (searchText.contains(rule.getKeyword().toLowerCase())) {
                return rule.getCategoryId();
            }
        }

        // Then check global rules (userId = null)
        List<CategorizationRule> globalRules = ruleRepository.findByUserIdIsNull();
        for (CategorizationRule rule : globalRules) {
            if (searchText.contains(rule.getKeyword().toLowerCase())) {
                return rule.getCategoryId();
            }
        }

        return null; // No matching rule found
    }
}

