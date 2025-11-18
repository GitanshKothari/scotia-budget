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
    List<Transaction> findByUserId(UUID userId);
    
    @Query("SELECT t FROM Transaction t WHERE t.userId = :userId " +
           "AND (:accountId IS NULL OR t.accountId = :accountId) " +
           "AND (:categoryId IS NULL OR t.categoryId = :categoryId) " +
           "AND (:startDate IS NULL OR t.date >= :startDate) " +
           "AND (:endDate IS NULL OR t.date <= :endDate) " +
           "AND (:minAmount IS NULL OR t.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR t.amount <= :maxAmount) " +
           "AND (:search IS NULL OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(t.merchantName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Transaction> findWithFilters(
        @Param("userId") UUID userId,
        @Param("accountId") UUID accountId,
        @Param("categoryId") UUID categoryId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("minAmount") java.math.BigDecimal minAmount,
        @Param("maxAmount") java.math.BigDecimal maxAmount,
        @Param("search") String search
    );
}

