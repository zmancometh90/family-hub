package com.github.zmancometh90.familyhub.models;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    private String location;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.PLANNED;

    private boolean isRecurring = false;

    @Column(name = "recurrence_pattern")
    private String recurrencePattern;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "event_attendees",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> attendees;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum EventType {
        BIRTHDAY,
        ANNIVERSARY,
        HOLIDAY,
        VACATION,
        REUNION,
        CELEBRATION,
        APPOINTMENT,
        MEETING,
        OTHER
    }

    public enum EventStatus {
        PLANNED,
        CONFIRMED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }

    public Event() {}

    public Event(String title, String description, LocalDateTime startTime, LocalDateTime endTime, User createdBy) {
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.createdBy = createdBy;
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

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
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

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public List<User> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<User> attendees) {
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