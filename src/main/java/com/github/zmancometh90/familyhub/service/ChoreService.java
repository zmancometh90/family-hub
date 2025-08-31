package com.github.zmancometh90.familyhub.service;

import com.github.zmancometh90.familyhub.models.*;
import com.github.zmancometh90.familyhub.repository.ChoreRepository;
import com.github.zmancometh90.familyhub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChoreService {

    @Autowired
    private ChoreRepository choreRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ChoreDTO> getAllChores() {
        return choreRepository.findAll().stream()
                .map(ChoreDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ChoreDTO> getChoreById(UUID id) {
        return choreRepository.findById(id)
                .map(ChoreDTO::new);
    }

    public ChoreDTO createChore(ChoreRequest request, User createdBy) {
        Chore chore = new Chore();
        chore.setTitle(request.title());
        chore.setDescription(request.description());
        chore.setDueDate(request.dueDate());
        chore.setEstimatedDurationMinutes(request.estimatedDurationMinutes());
        chore.setCreatedBy(createdBy);
        chore.setRecurring(request.isRecurring());
        chore.setRecurrencePattern(request.recurrencePattern());

        // Set chore type
        if (request.choreType() != null) {
            try {
                chore.setChoreType(Chore.ChoreType.valueOf(request.choreType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                chore.setChoreType(Chore.ChoreType.OTHER);
            }
        }

        // Set priority
        if (request.priority() != null) {
            try {
                chore.setPriority(Chore.ChorePriority.valueOf(request.priority().toUpperCase()));
            } catch (IllegalArgumentException e) {
                chore.setPriority(Chore.ChorePriority.MEDIUM);
            }
        }

        // Set assigned user
        if (request.assignedToId() != null && !request.assignedToId().trim().isEmpty()) {
            try {
                UUID assignedToId = UUID.fromString(request.assignedToId());
                Optional<User> assignedUser = userRepository.findById(assignedToId);
                assignedUser.ifPresent(chore::setAssignedTo);
            } catch (IllegalArgumentException e) {
                // Invalid UUID format, leave assignedTo as null
            }
        }

        Chore savedChore = choreRepository.save(chore);
        return new ChoreDTO(savedChore);
    }

    public Optional<ChoreDTO> updateChore(UUID id, ChoreRequest request, User updatedBy) {
        return choreRepository.findById(id).map(chore -> {
            chore.setTitle(request.title());
            chore.setDescription(request.description());
            chore.setDueDate(request.dueDate());
            chore.setEstimatedDurationMinutes(request.estimatedDurationMinutes());
            chore.setRecurring(request.isRecurring());
            chore.setRecurrencePattern(request.recurrencePattern());

            // Update chore type
            if (request.choreType() != null) {
                try {
                    chore.setChoreType(Chore.ChoreType.valueOf(request.choreType().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    chore.setChoreType(Chore.ChoreType.OTHER);
                }
            }

            // Update priority
            if (request.priority() != null) {
                try {
                    chore.setPriority(Chore.ChorePriority.valueOf(request.priority().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    chore.setPriority(Chore.ChorePriority.MEDIUM);
                }
            }

            // Update assigned user
            if (request.assignedToId() != null && !request.assignedToId().trim().isEmpty()) {
                try {
                    UUID assignedToId = UUID.fromString(request.assignedToId());
                    Optional<User> assignedUser = userRepository.findById(assignedToId);
                    assignedUser.ifPresent(chore::setAssignedTo);
                } catch (IllegalArgumentException e) {
                    // Invalid UUID format, leave assignedTo unchanged
                }
            } else {
                chore.setAssignedTo(null);
            }

            Chore updatedChore = choreRepository.save(chore);
            return new ChoreDTO(updatedChore);
        });
    }

    public boolean deleteChore(UUID id) {
        if (choreRepository.existsById(id)) {
            choreRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<ChoreDTO> getChoresByAssignedUser(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return choreRepository.findByAssignedTo(user.get()).stream()
                    .map(ChoreDTO::new)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    public List<ChoreDTO> getChoresByStatus(String status) {
        try {
            Chore.ChoreStatus choreStatus = Chore.ChoreStatus.valueOf(status.toUpperCase());
            return choreRepository.findByStatus(choreStatus).stream()
                    .map(ChoreDTO::new)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    public List<ChoreDTO> getChoresByDateRange(LocalDate startDate, LocalDate endDate) {
        return choreRepository.findByDueDateBetween(startDate, endDate).stream()
                .map(ChoreDTO::new)
                .collect(Collectors.toList());
    }

    public Optional<ChoreDTO> updateChoreStatus(UUID id, String status) {
        return choreRepository.findById(id).map(chore -> {
            try {
                Chore.ChoreStatus choreStatus = Chore.ChoreStatus.valueOf(status.toUpperCase());
                chore.setStatus(choreStatus);
                Chore updatedChore = choreRepository.save(chore);
                return new ChoreDTO(updatedChore);
            } catch (IllegalArgumentException e) {
                return new ChoreDTO(chore); // Return unchanged if invalid status
            }
        });
    }

    public Optional<ChoreDTO> updateChoreStatus(UUID id, String status, User completingUser) {
        return choreRepository.findById(id).map(chore -> {
            try {
                Chore.ChoreStatus choreStatus = Chore.ChoreStatus.valueOf(status.toUpperCase());
                chore.setStatus(choreStatus);
                
                // If status is COMPLETED, set completedBy and completedAt
                if (choreStatus == Chore.ChoreStatus.COMPLETED) {
                    chore.setCompletedBy(completingUser);
                    if (chore.getCompletedAt() == null) {
                        chore.setCompletedAt(LocalDateTime.now());
                    }
                } else if (choreStatus != Chore.ChoreStatus.COMPLETED) {
                    // If changing from completed to another status, clear completion info
                    chore.setCompletedBy(null);
                    chore.setCompletedAt(null);
                }
                
                Chore updatedChore = choreRepository.save(chore);
                return new ChoreDTO(updatedChore);
            } catch (IllegalArgumentException e) {
                return new ChoreDTO(chore); // Return unchanged if invalid status
            }
        });
    }

    public List<ChoreDTO> getOverdueChores() {
        return choreRepository.findOverdueChores(LocalDate.now()).stream()
                .map(ChoreDTO::new)
                .collect(Collectors.toList());
    }
}