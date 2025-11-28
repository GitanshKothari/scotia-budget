package com.scotia.core.repository;

import com.scotia.core.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByUser_Id(UUID userId);
    List<Budget> findByUser_IdAndIsActive(UUID userId, Boolean isActive);
}

