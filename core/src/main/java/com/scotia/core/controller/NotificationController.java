package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.MarkReadRequest;
import com.scotia.core.dto.NotificationResponse;
import com.scotia.core.entity.Notification;
import com.scotia.core.repository.NotificationRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/core/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestParam(required = false, defaultValue = "false") Boolean unreadOnly) {
        UUID userId = UUID.fromString(userIdHeader);

        List<Notification> notifications;
        if (unreadOnly) {
            notifications = notificationRepository.findByUserIdAndRead(userId, false);
        } else {
            notifications = notificationRepository.findByUserId(userId);
        }

        List<NotificationResponse> responses = notifications.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/markRead")
    public ResponseEntity<ApiResponse<Object>> markRead(
            @RequestHeader("X-User-Id") String userIdHeader,
            @Valid @RequestBody MarkReadRequest request) {
        UUID userId = UUID.fromString(userIdHeader);

        List<Notification> notifications = notificationRepository.findAllById(request.getIds());
        
        for (Notification notification : notifications) {
            if (notification.getUserId().equals(userId)) {
                notification.setRead(true);
            }
        }

        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}

