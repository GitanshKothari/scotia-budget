package com.scotia.core.controller;

import com.scotia.core.dto.ApiResponse;
import com.scotia.core.dto.DashboardSummaryResponse;
import com.scotia.core.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/core/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestHeader("X-User-Id") String userIdHeader,
            @RequestParam String month) {
        UUID userId = UUID.fromString(userIdHeader);
        DashboardSummaryResponse response = dashboardService.getSummary(userId, month);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

