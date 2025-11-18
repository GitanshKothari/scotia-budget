package com.scotia.core.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class UserHeaderInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Skip for health and auth endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/core/health") || path.startsWith("/core/auth")) {
            return true;
        }

        // Check for X-User-Id header for user-scoped endpoints
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null || userIdHeader.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"X-User-Id header is required\",\"code\":\"MISSING_USER_ID\"}");
            return false;
        }

        // Validate UUID format
        try {
            UUID.fromString(userIdHeader);
        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().write("{\"success\":false,\"message\":\"Invalid X-User-Id format\",\"code\":\"INVALID_USER_ID\"}");
            return false;
        }

        return true;
    }
}

