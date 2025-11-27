package com.scotia.core.repository;

import com.scotia.core.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    
    @Query(value = "SELECT t.id, t.user_id, t.category_id, t.amount, t.description, " +
           "t.merchant_name, t.date, t.created_at, t.updated_at " +
           "FROM transactions t WHERE t.user_id = :userId " +
           "AND (t.category_id = COALESCE(:categoryId, t.category_id)) " +
           "AND (t.date >= COALESCE(:startDate, CAST('1970-01-01' AS timestamp))) " +
           "AND (t.date <= COALESCE(:endDate, CAST('9999-12-31' AS timestamp)))", nativeQuery = true)
    List<Transaction> findWithFilters(
        @Param("userId") UUID userId,
        @Param("categoryId") UUID categoryId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}

