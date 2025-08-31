package com.github.zmancometh90.familyhub.controllers;

import com.github.zmancometh90.familyhub.models.ApiResponse;
import com.github.zmancometh90.familyhub.models.User;
import com.github.zmancometh90.familyhub.models.UserDTO;
import com.github.zmancometh90.familyhub.models.UserRequest;
import com.github.zmancometh90.familyhub.security.UserPrincipal;
import com.github.zmancometh90.familyhub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@RequestBody UserRequest request) {
        ApiResponse<UserDTO> response = new ApiResponse<>();
        try {
            UserDTO userDTO = userService.createUser(request);
            response.setData(userDTO);
            response.setMessage("User created successfully");
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
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        ApiResponse<List<UserDTO>> response = new ApiResponse<>();
        List<UserDTO> users = userService.getAllUsers();
        response.setData(users);
        response.setMessage("Users retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(Authentication authentication) {
        ApiResponse<UserDTO> response = new ApiResponse<>();
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
        
        UserDTO user = userService.findUserById(currentUser.getId());
        
        if (user == null) {
            response.setData(null);
            response.setMessage("User not found");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setData(user);
        response.setMessage("Current user retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable UUID id, Authentication authentication) {
        ApiResponse<UserDTO> response = new ApiResponse<>();
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
        
        // BASIC_USER can only view their own profile
        if (currentUser.getRole() == User.Role.BASIC_USER && !currentUser.getId().equals(id)) {
            response.setData(null);
            response.setMessage("Access denied: You can only view your own profile");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        UserDTO user = userService.findUserById(id);
        
        if (user == null) {
            response.setData(null);
            response.setMessage("User not found");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setData(user);
        response.setMessage("User found successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<UserDTO>> findUserByUsername(@RequestParam String username) {
        ApiResponse<UserDTO> response = new ApiResponse<>();
        UserDTO user = userService.findUserByUsername(username);
        
        if (user == null) {
            response.setData(null);
            response.setMessage("User not found");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setData(user);
        response.setMessage("User found successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(@PathVariable UUID id, @RequestBody UserDTO userDTO, Authentication authentication) {
        ApiResponse<UserDTO> response = new ApiResponse<>();
        UserPrincipal currentUser = (UserPrincipal) authentication.getPrincipal();
        
        // BASIC_USER can only update their own profile
        if (currentUser.getRole() == User.Role.BASIC_USER && !currentUser.getId().equals(id)) {
            response.setData(null);
            response.setMessage("Access denied: You can only update your own profile");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        // BASIC_USER cannot change their own role
        if (currentUser.getRole() == User.Role.BASIC_USER && userDTO.getRole() != currentUser.getRole()) {
            response.setData(null);
            response.setMessage("Access denied: You cannot change your own role");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        try {
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            response.setData(updatedUser);
            response.setMessage("User updated successfully");
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
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        ApiResponse<Void> response = new ApiResponse<>();
        try {
            userService.deleteUser(id);
            response.setData(null);
            response.setMessage("User deleted successfully");
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
