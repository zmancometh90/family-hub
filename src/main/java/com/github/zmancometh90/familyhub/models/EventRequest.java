package com.github.zmancometh90.familyhub.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EventRequest(
        String title,
        String description,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        Event.EventType eventType,
        boolean isRecurring,
        String recurrencePattern,
        UUID createdById,
        List<UUID> attendeeIds
) {
}