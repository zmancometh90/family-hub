package com.github.zmancometh90.familyhub.service;

import com.github.zmancometh90.familyhub.models.User;
import com.github.zmancometh90.familyhub.models.UserDTO;
import com.github.zmancometh90.familyhub.models.UserRequest;
import com.github.zmancometh90.familyhub.models.PasswordChangeRequest;
import com.github.zmancometh90.familyhub.models.AdminPasswordChangeRequest;
import com.github.zmancometh90.familyhub.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    public UserDTO createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("User with username " + request.username() + " already exists");
        }

        // Use role from request, defaulting to BASIC_USER if null
        User.Role roleToAssign = request.role() != null ? request.role() : User.Role.BASIC_USER;

        User userToSave = new User(
            request.username(),
            passwordEncoder.encode(request.password()),
            request.name(),
            roleToAssign
        );
        userRepository.save(userToSave);
        return toDTO(userToSave);
    }

    public UserDTO updateUser(UUID id, UserDTO userDTO) {
        Optional<User> foundUser = userRepository.findById(id);

        if (foundUser.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }

        User userToUpdate = foundUser.get();
        userToUpdate.setName(userDTO.getName());
        userToUpdate.setUsername(userDTO.getUsername());
        userToUpdate.setRole(userDTO.getRole());
        userToUpdate.setActive(userDTO.isActive());

        userRepository.save(userToUpdate);
        return toDTO(userToUpdate);
    }

    public UserDTO findUserById(UUID id) {
        Optional<User> foundUser = userRepository.findById(id);
        return foundUser.map(this::toDTO).orElse(null);
    }

    public UserDTO findUserByName(String name) {
        Optional<User> foundUser = userRepository.findByName(name);
        return foundUser.map(this::toDTO).orElse(null);
    }

    public UserDTO findUserByUsername(String username) {
        Optional<User> foundUser = userRepository.findByUsername(username);
        return foundUser.map(this::toDTO).orElse(null);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public void changePassword(UUID userId, PasswordChangeRequest request) {
        Optional<User> foundUser = userRepository.findById(userId);
        
        if (foundUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = foundUser.get();
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void adminChangePassword(UUID adminId, AdminPasswordChangeRequest request) {
        // Verify admin user exists and has admin role
        Optional<User> adminUser = userRepository.findById(adminId);
        if (adminUser.isEmpty()) {
            throw new RuntimeException("Admin user not found");
        }

        if (adminUser.get().getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only administrators can change other users' passwords");
        }

        // Verify admin password
        if (!passwordEncoder.matches(request.getAdminPassword(), adminUser.get().getPassword())) {
            throw new RuntimeException("Admin password is incorrect");
        }

        // Find target user
        Optional<User> targetUser = userRepository.findById(request.getTargetUserId());
        if (targetUser.isEmpty()) {
            throw new RuntimeException("Target user not found");
        }

        // Validate new password
        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        // Update target user's password
        User user = targetUser.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
