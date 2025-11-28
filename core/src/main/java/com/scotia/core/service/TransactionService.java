package com.scotia.core.service;

import com.scotia.core.dto.TransactionRequest;
import com.scotia.core.dto.TransactionResponse;
import com.scotia.core.dto.UpdateTransactionRequest;
import com.scotia.core.entity.Category;
import com.scotia.core.entity.Transaction;
import com.scotia.core.entity.User;
import com.scotia.core.repository.CategoryRepository;
import com.scotia.core.repository.TransactionRepository;
import com.scotia.core.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<TransactionResponse> getTransactions(
            UUID userId,
            UUID categoryId,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        List<Transaction> transactions = transactionRepository.findWithFilters(
                userId, categoryId, startDate, endDate);

        return transactions.stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TransactionResponse createTransaction(UUID userId, TransactionRequest request) {
        User user = userRepository.getReferenceById(userId);
        
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.getReferenceById(request.getCategoryId());
            transaction.setCategory(category);
        }
        
        transaction.setAmount(request.getAmount());
        transaction.setDescription(request.getDescription());
        transaction.setMerchantName(request.getMerchantName());
        transaction.setDate(request.getDate());

        Transaction savedTransaction = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(savedTransaction);
    }

    public TransactionResponse updateTransaction(UUID userId, UUID id, UpdateTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Transaction does not belong to user");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.getReferenceById(request.getCategoryId());
            transaction.setCategory(category);
        }
        if (request.getAmount() != null) {
            transaction.setAmount(request.getAmount());
        }
        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getMerchantName() != null) {
            transaction.setMerchantName(request.getMerchantName());
        }
        if (request.getDate() != null) {
            transaction.setDate(request.getDate());
        }

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(updatedTransaction);
    }

    public void deleteTransaction(UUID userId, UUID id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        if (!transaction.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Transaction does not belong to user");
        }

        transactionRepository.delete(transaction);
    }
}

