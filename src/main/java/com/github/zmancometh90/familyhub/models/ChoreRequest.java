package com.github.zmancometh90.familyhub.models;

import java.time.LocalDate;

public record ChoreRequest(
    String title,
    String description,
    LocalDate dueDate,
    Integer estimatedDurationMinutes,
    String choreType,
    String priority,
    String assignedToId,
    boolean isRecurring,
    String recurrencePattern
) {
    public ChoreRequest {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Chore title cannot be null or empty");
        }
    }
}