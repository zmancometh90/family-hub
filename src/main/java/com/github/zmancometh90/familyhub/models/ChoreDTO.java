package com.github.zmancometh90.familyhub.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ChoreDTO {
    private String id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private Integer estimatedDurationMinutes;
    private String choreType;
    private String status;
    private String priority;
    private Object assignedTo; // Can be UserDTO or just ID string
    private Object createdBy; // Can be UserDTO or just ID string
    private Object completedBy; // Can be UserDTO or just ID string
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isRecurring;
    private String recurrencePattern;

    public ChoreDTO() {}

    public ChoreDTO(Chore chore) {
        this.id = chore.getId() != null ? chore.getId().toString() : null;
        this.title = chore.getTitle();
        this.description = chore.getDescription();
        this.dueDate = chore.getDueDate();
        this.estimatedDurationMinutes = chore.getEstimatedDurationMinutes();
        this.choreType = chore.getChoreType() != null ? chore.getChoreType().toString() : null;
        this.status = chore.getStatus() != null ? chore.getStatus().toString() : null;
        this.priority = chore.getPriority() != null ? chore.getPriority().toString() : null;
        this.assignedTo = chore.getAssignedTo() != null ? chore.getAssignedTo().getId().toString() : null;
        this.createdBy = chore.getCreatedBy() != null ? chore.getCreatedBy().getId().toString() : null;
        this.completedBy = chore.getCompletedBy() != null ? chore.getCompletedBy().getId().toString() : null;
        this.completedAt = chore.getCompletedAt();
        this.createdAt = chore.getCreatedAt();
        this.updatedAt = chore.getUpdatedAt();
        this.isRecurring = chore.isRecurring();
        this.recurrencePattern = chore.getRecurrencePattern();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getEstimatedDurationMinutes() {
        return estimatedDurationMinutes;
    }

    public void setEstimatedDurationMinutes(Integer estimatedDurationMinutes) {
        this.estimatedDurationMinutes = estimatedDurationMinutes;
    }

    public String getChoreType() {
        return choreType;
    }

    public void setChoreType(String choreType) {
        this.choreType = choreType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Object getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Object assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Object getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Object createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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

    public Object getCompletedBy() {
        return completedBy;
    }

    public void setCompletedBy(Object completedBy) {
        this.completedBy = completedBy;
    }
}