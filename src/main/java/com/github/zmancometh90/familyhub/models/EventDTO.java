package com.github.zmancometh90.familyhub.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class EventDTO {

    private UUID id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private Event.EventType eventType;
    private Event.EventStatus status;
    private boolean isRecurring;
    private String recurrencePattern;
    private UserDTO createdBy;
    private List<UserDTO> attendees;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EventDTO() {}

    public EventDTO(UUID id, String title, String description, LocalDateTime startTime, LocalDateTime endTime,
                   String location, Event.EventType eventType, Event.EventStatus status,
                   boolean isRecurring, String recurrencePattern, UserDTO createdBy,
                   List<UserDTO> attendees, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.eventType = eventType;
        this.status = status;
        this.isRecurring = isRecurring;
        this.recurrencePattern = recurrencePattern;
        this.createdBy = createdBy;
        this.attendees = attendees;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Event.EventType getEventType() {
        return eventType;
    }

    public void setEventType(Event.EventType eventType) {
        this.eventType = eventType;
    }

    public Event.EventStatus getStatus() {
        return status;
    }

    public void setStatus(Event.EventStatus status) {
        this.status = status;
    }

    public boolean isRecurring() {
        return isRecurring;
    }

    public void setRecurring(boolean recurring) {
        isRecurring = recurring;
    }

    public String getRecurrencePattern() {
        return recurrencePattern;
    }

    public void setRecurrencePattern(String recurrencePattern) {
        this.recurrencePattern = recurrencePattern;
    }

    public UserDTO getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserDTO createdBy) {
        this.createdBy = createdBy;
    }

    public List<UserDTO> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<UserDTO> attendees) {
        this.attendees = attendees;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}