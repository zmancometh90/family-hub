package com.github.zmancometh90.familyhub.service;

import com.github.zmancometh90.familyhub.models.User;
import com.github.zmancometh90.familyhub.models.UserDTO;
import com.github.zmancometh90.familyhub.models.UserRequest;
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
}
