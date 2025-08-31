package com.github.zmancometh90.familyhub.controllers;

import com.github.zmancometh90.familyhub.models.*;
import com.github.zmancometh90.familyhub.security.UserPrincipal;
import com.github.zmancometh90.familyhub.service.ChoreService;
import com.github.zmancometh90.familyhub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chores")
public class ChoreController {

    @Autowired
    private ChoreService choreService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChoreDTO>>> getAllChores(Authentication authentication) {
        ApiResponse<List<ChoreDTO>> response = new ApiResponse<>();
        
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();

        List<ChoreDTO> chores = choreService.getAllChores();
        response.setSuccess(true);
        response.setMessage("Chores retrieved successfully");
        response.setData(chores);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChoreDTO>> getChoreById(@PathVariable String id, Authentication authentication) {
        ApiResponse<ChoreDTO> response = new ApiResponse<>();
        
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();

        try {
            UUID choreId = UUID.fromString(id);
            Optional<ChoreDTO> chore = choreService.getChoreById(choreId);
            
            if (chore.isPresent()) {
                response.setSuccess(true);
                response.setMessage("Chore retrieved successfully");
                response.setData(chore.get());
                return ResponseEntity.ok(response);
            } else {
                response.setSuccess(false);
                response.setMessage("Chore not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setMessage("Invalid chore ID format");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChoreDTO>> createChore(@RequestBody ChoreRequest request, Authentication authentication) {
        ApiResponse<ChoreDTO> response = new ApiResponse<>();
        
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();

        // Only admins can create chores
        if (currentUser.getRole() != User.Role.ADMIN) {
            response.setSuccess(false);
            response.setMessage("Only administrators can create chores");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            User user = convertUserPrincipalToUser(currentUser);
            ChoreDTO createdChore = choreService.createChore(request, user);
            response.setSuccess(true);
            response.setMessage("Chore created successfully");
            response.setData(createdChore);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error creating chore: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChoreDTO>> updateChore(@PathVariable String id, @RequestBody ChoreRequest request, Authentication authentication) {
        ApiResponse<ChoreDTO> response = new ApiResponse<>();
        
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();

        // Only admins can update chores
        if (currentUser.getRole() != User.Role.ADMIN) {
            response.setSuccess(false);
            response.setMessage("Only administrators can update chores");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            UUID choreId = UUID.fromString(id);
            User user = convertUserPrincipalToUser(currentUser);
            Optional<ChoreDTO> updatedChore = choreService.updateChore(choreId, request, user);
            
            if (updatedChore.isPresent()) {
                response.setSuccess(true);
                response.setMessage("Chore updated successfully");
                response.setData(updatedChore.get());
                return ResponseEntity.ok(response);
            } else {
                response.setSuccess(false);
                response.setMessage("Chore not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setMessage("Invalid chore ID format");
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error updating chore: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChore(@PathVariable String id, Authentication authentication) {
        ApiResponse<Void> response = new ApiResponse<>();
        
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();

        // Only admins can delete chores
        if (currentUser.getRole() != User.Role.ADMIN) {
            response.setSuccess(false);
            response.setMessage("Only administrators can delete chores");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            UUID choreId = UUID.fromString(id);
            boolean deleted = choreService.deleteChore(choreId);
            
            if (deleted) {
                response.setSuccess(true);
                response.setMessage("Chore deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.setSuccess(false);
                response.setMessage("Chore not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setMessage("Invalid chore ID format");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ChoreDTO>> updateChoreStatus(@PathVariable String id, @RequestBody String status, Authentication authentication) {
        ApiResponse<ChoreDTO> response = new ApiResponse<>();
        
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();

        try {
            UUID choreId = UUID.fromString(id);
            User user = convertUserPrincipalToUser(currentUser);
            Optional<ChoreDTO> updatedChore = choreService.updateChoreStatus(choreId, status, user);
            
            if (updatedChore.isPresent()) {
                response.setSuccess(true);
                response.setMessage("Chore status updated successfully");
                response.setData(updatedChore.get());
                return ResponseEntity.ok(response);
            } else {
                response.setSuccess(false);
                response.setMessage("Chore not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setMessage("Invalid chore ID format");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/assigned/{userId}")
    public ResponseEntity<ApiResponse<List<ChoreDTO>>> getChoresByAssignedUser(@PathVariable String userId, Authentication authentication) {
        ApiResponse<List<ChoreDTO>> response = new ApiResponse<>();

        try {
            UUID assignedUserId = UUID.fromString(userId);
            List<ChoreDTO> chores = choreService.getChoresByAssignedUser(assignedUserId);
            response.setSuccess(true);
            response.setMessage("Chores retrieved successfully");
            response.setData(chores);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.setSuccess(false);
            response.setMessage("Invalid user ID format");
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ChoreDTO>>> getChoresByStatus(@PathVariable String status, Authentication authentication) {
        ApiResponse<List<ChoreDTO>> response = new ApiResponse<>();

        List<ChoreDTO> chores = choreService.getChoresByStatus(status);
        response.setSuccess(true);
        response.setMessage("Chores retrieved successfully");
        response.setData(chores);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<ChoreDTO>>> getOverdueChores(Authentication authentication) {
        ApiResponse<List<ChoreDTO>> response = new ApiResponse<>();

        List<ChoreDTO> chores = choreService.getOverdueChores();
        response.setSuccess(true);
        response.setMessage("Overdue chores retrieved successfully");
        response.setData(chores);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<ChoreDTO>>> getChoresByDateRange(
            @RequestParam String startDate, 
            @RequestParam String endDate, 
            Authentication authentication) {
        ApiResponse<List<ChoreDTO>> response = new ApiResponse<>();

        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<ChoreDTO> chores = choreService.getChoresByDateRange(start, end);
            response.setSuccess(true);
            response.setMessage("Chores retrieved successfully");
            response.setData(chores);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Invalid date format");
            return ResponseEntity.badRequest().body(response);
        }
    }

    private User convertUserPrincipalToUser(UserPrincipal userPrincipal) {
        User user = new User();
        user.setId(userPrincipal.getId());
        user.setUsername(userPrincipal.getUsername());
        user.setName(userPrincipal.getName());
        user.setRole(userPrincipal.getRole());
        user.setActive(userPrincipal.isActive());
        return user;
    }
}