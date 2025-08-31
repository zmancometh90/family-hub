package com.github.zmancometh90.familyhub.controllers;

import com.github.zmancometh90.familyhub.models.ApiResponse;
import com.github.zmancometh90.familyhub.models.Event;
import com.github.zmancometh90.familyhub.models.EventDTO;
import com.github.zmancometh90.familyhub.models.EventRequest;
import com.github.zmancometh90.familyhub.service.EventService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {
    
    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventDTO>> createEvent(@RequestBody EventRequest request) {
        ApiResponse<EventDTO> response = new ApiResponse<>();
        try {
            EventDTO eventDTO = eventService.createEvent(request);
            response.setData(eventDTO);
            response.setMessage("Event created successfully");
            response.setSuccess(true);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventDTO>>> getAllEvents() {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        List<EventDTO> events = eventService.getAllEvents();
        response.setData(events);
        response.setMessage("Events retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDTO>> getEventById(@PathVariable UUID id) {
        ApiResponse<EventDTO> response = new ApiResponse<>();
        EventDTO event = eventService.findEventById(id);
        
        if (event == null) {
            response.setData(null);
            response.setMessage("Event not found");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setData(event);
        response.setMessage("Event found successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByUser(@PathVariable UUID userId) {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        try {
            List<EventDTO> events = eventService.getEventsByUser(userId);
            response.setData(events);
            response.setMessage("User events retrieved successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        List<EventDTO> events = eventService.getEventsByDateRange(start, end);
        response.setData(events);
        response.setMessage("Events for date range retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByUserAndDateRange(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        try {
            List<EventDTO> events = eventService.getEventsByUserAndDateRange(userId, start, end);
            response.setData(events);
            response.setMessage("User events for date range retrieved successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @GetMapping("/type/{eventType}")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByType(@PathVariable Event.EventType eventType) {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        List<EventDTO> events = eventService.getEventsByType(eventType);
        response.setData(events);
        response.setMessage("Events by type retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getEventsByStatus(@PathVariable Event.EventStatus status) {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        List<EventDTO> events = eventService.getEventsByStatus(status);
        response.setData(events);
        response.setMessage("Events by status retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<EventDTO>>> searchEvents(@RequestParam String q) {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        List<EventDTO> events = eventService.searchEvents(q);
        response.setData(events);
        response.setMessage("Search results retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recurring")
    public ResponseEntity<ApiResponse<List<EventDTO>>> getRecurringEvents() {
        ApiResponse<List<EventDTO>> response = new ApiResponse<>();
        List<EventDTO> events = eventService.getRecurringEvents();
        response.setData(events);
        response.setMessage("Recurring events retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EventDTO>> updateEvent(@PathVariable UUID id, @RequestBody EventDTO eventDTO) {
        ApiResponse<EventDTO> response = new ApiResponse<>();
        try {
            EventDTO updatedEvent = eventService.updateEvent(id, eventDTO);
            response.setData(updatedEvent);
            response.setMessage("Event updated successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable UUID id) {
        ApiResponse<Void> response = new ApiResponse<>();
        try {
            eventService.deleteEvent(id);
            response.setData(null);
            response.setMessage("Event deleted successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping("/{eventId}/attendees/{userId}")
    public ResponseEntity<ApiResponse<EventDTO>> addAttendee(@PathVariable UUID eventId, @PathVariable UUID userId) {
        ApiResponse<EventDTO> response = new ApiResponse<>();
        try {
            EventDTO updatedEvent = eventService.addAttendeeToEvent(eventId, userId);
            response.setData(updatedEvent);
            response.setMessage("Attendee added successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @DeleteMapping("/{eventId}/attendees/{userId}")
    public ResponseEntity<ApiResponse<EventDTO>> removeAttendee(@PathVariable UUID eventId, @PathVariable UUID userId) {
        ApiResponse<EventDTO> response = new ApiResponse<>();
        try {
            EventDTO updatedEvent = eventService.removeAttendeeFromEvent(eventId, userId);
            response.setData(updatedEvent);
            response.setMessage("Attendee removed successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}