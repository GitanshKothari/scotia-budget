package com.scotia.core.dto;

import com.scotia.core.entity.Notification;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationResponse {
    private UUID id;
    private UUID userId;
    private Notification.NotificationType type;
    private String title;
    private String message;
    private LocalDateTime createdAt;
    private Boolean read;
    private String dataJson;

    public static NotificationResponse fromEntity(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setUserId(notification.getUserId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setCreatedAt(notification.getCreatedAt());
        response.setRead(notification.getRead());
        response.setDataJson(notification.getDataJson());
        return response;
    }
}

