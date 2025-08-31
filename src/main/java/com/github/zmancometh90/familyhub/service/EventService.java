package com.github.zmancometh90.familyhub.service;

import com.github.zmancometh90.familyhub.models.*;
import com.github.zmancometh90.familyhub.repository.EventRepository;
import com.github.zmancometh90.familyhub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventService {
    
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public EventService(EventRepository eventRepository, UserRepository userRepository, UserService userService) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    private EventDTO toDTO(Event event) {
        UserDTO createdByDTO = userService.findUserById(event.getCreatedBy().getId());
        
        List<UserDTO> attendeeDTOs = event.getAttendees() != null ? 
            event.getAttendees().stream()
                .map(user -> userService.findUserById(user.getId()))
                .collect(Collectors.toList()) : 
            List.of();

        return new EventDTO(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getEventType(),
                event.getStatus(),
                event.isRecurring(),
                event.getRecurrencePattern(),
                createdByDTO,
                attendeeDTOs,
                event.getCreatedAt(),
                event.getUpdatedAt()
        );
    }

    public EventDTO createEvent(EventRequest request) {
        Optional<User> createdBy = userRepository.findById(request.createdById());
        if (createdBy.isEmpty()) {
            throw new RuntimeException("Creator user not found with id: " + request.createdById());
        }

        Event event = new Event(request.title(), request.description(), request.startTime(), request.endTime(), createdBy.get());
        event.setLocation(request.location());
        event.setEventType(request.eventType());
        event.setRecurring(request.isRecurring());
        event.setRecurrencePattern(request.recurrencePattern());

        if (request.attendeeIds() != null && !request.attendeeIds().isEmpty()) {
            List<User> attendees = userRepository.findAllById(request.attendeeIds());
            event.setAttendees(attendees);
        }

        eventRepository.save(event);
        return toDTO(event);
    }

    public EventDTO updateEvent(UUID id, EventDTO eventDTO) {
        Optional<Event> foundEvent = eventRepository.findById(id);
        if (foundEvent.isEmpty()) {
            throw new RuntimeException("Event not found with id: " + id);
        }

        Event eventToUpdate = foundEvent.get();
        eventToUpdate.setTitle(eventDTO.getTitle());
        eventToUpdate.setDescription(eventDTO.getDescription());
        eventToUpdate.setStartTime(eventDTO.getStartTime());
        eventToUpdate.setEndTime(eventDTO.getEndTime());
        eventToUpdate.setLocation(eventDTO.getLocation());
        eventToUpdate.setEventType(eventDTO.getEventType());
        eventToUpdate.setStatus(eventDTO.getStatus());
        eventToUpdate.setRecurring(eventDTO.isRecurring());
        eventToUpdate.setRecurrencePattern(eventDTO.getRecurrencePattern());

        eventRepository.save(eventToUpdate);
        return toDTO(eventToUpdate);
    }

    public EventDTO findEventById(UUID id) {
        Optional<Event> foundEvent = eventRepository.findById(id);
        return foundEvent.map(this::toDTO).orElse(null);
    }

    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByUser(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        return eventRepository.findEventsByUserParticipation(user.get()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByStartTimeBetween(start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByUserAndDateRange(UUID userId, LocalDateTime start, LocalDateTime end) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        return eventRepository.findEventsByUserAndDateRange(user.get(), start, end).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByType(Event.EventType eventType) {
        return eventRepository.findByEventType(eventType).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByStatus(Event.EventStatus status) {
        return eventRepository.findByStatus(status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> searchEvents(String searchTerm) {
        return eventRepository.findByTitleOrDescriptionContainingIgnoreCase(searchTerm).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getRecurringEvents() {
        return eventRepository.findByIsRecurringTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteEvent(UUID id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }

    public EventDTO addAttendeeToEvent(UUID eventId, UUID userId) {
        Optional<Event> event = eventRepository.findById(eventId);
        Optional<User> user = userRepository.findById(userId);
        
        if (event.isEmpty()) {
            throw new RuntimeException("Event not found with id: " + eventId);
        }
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        Event eventToUpdate = event.get();
        if (eventToUpdate.getAttendees() == null) {
            eventToUpdate.setAttendees(List.of(user.get()));
        } else if (!eventToUpdate.getAttendees().contains(user.get())) {
            eventToUpdate.getAttendees().add(user.get());
        }

        eventRepository.save(eventToUpdate);
        return toDTO(eventToUpdate);
    }

    public EventDTO removeAttendeeFromEvent(UUID eventId, UUID userId) {
        Optional<Event> event = eventRepository.findById(eventId);
        Optional<User> user = userRepository.findById(userId);
        
        if (event.isEmpty()) {
            throw new RuntimeException("Event not found with id: " + eventId);
        }
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        Event eventToUpdate = event.get();
        if (eventToUpdate.getAttendees() != null) {
            eventToUpdate.getAttendees().remove(user.get());
            eventRepository.save(eventToUpdate);
        }

        return toDTO(eventToUpdate);
    }
}