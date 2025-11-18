package com.scotia.core.repository;

import com.scotia.core.entity.CategorizationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategorizationRuleRepository extends JpaRepository<CategorizationRule, UUID> {
    List<CategorizationRule> findByUserIdIsNull();
    List<CategorizationRule> findByUserId(UUID userId);
}

