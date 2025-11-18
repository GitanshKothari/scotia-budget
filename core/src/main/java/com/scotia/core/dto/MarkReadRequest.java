package com.scotia.core.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class MarkReadRequest {
    @NotEmpty(message = "At least one notification ID is required")
    private List<UUID> ids;
}

