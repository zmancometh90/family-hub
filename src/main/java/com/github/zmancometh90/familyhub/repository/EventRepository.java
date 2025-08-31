package com.github.zmancometh90.familyhub.repository;

import com.github.zmancometh90.familyhub.models.Event;
import com.github.zmancometh90.familyhub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByCreatedBy(User user);
    
    List<Event> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    
    List<Event> findByEventType(Event.EventType eventType);
    
    List<Event> findByStatus(Event.EventStatus status);
    
    @Query("SELECT e FROM Event e WHERE e.createdBy = :user OR :user MEMBER OF e.attendees")
    List<Event> findEventsByUserParticipation(@Param("user") User user);
    
    @Query("SELECT e FROM Event e WHERE e.startTime >= :startDate AND e.startTime <= :endDate AND (e.createdBy = :user OR :user MEMBER OF e.attendees)")
    List<Event> findEventsByUserAndDateRange(@Param("user") User user, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    List<Event> findByIsRecurringTrue();
    
    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Event> findByTitleOrDescriptionContainingIgnoreCase(@Param("searchTerm") String searchTerm);
}