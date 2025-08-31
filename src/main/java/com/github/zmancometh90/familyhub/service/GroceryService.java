package com.github.zmancometh90.familyhub.service;

import com.github.zmancometh90.familyhub.models.*;
import com.github.zmancometh90.familyhub.repository.GroceryItemRepository;
import com.github.zmancometh90.familyhub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroceryService {
    
    private final GroceryItemRepository groceryItemRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public GroceryService(GroceryItemRepository groceryItemRepository, UserRepository userRepository, UserService userService) {
        this.groceryItemRepository = groceryItemRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    private GroceryItemDTO toDTO(GroceryItem item) {
        UserDTO addedByDTO = userService.findUserById(item.getAddedBy().getId());
        UserDTO completedByDTO = item.getCompletedBy() != null ? 
            userService.findUserById(item.getCompletedBy().getId()) : null;

        return new GroceryItemDTO(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getQuantity(),
                item.isCompleted(),
                addedByDTO,
                completedByDTO,
                item.getCompletedAt(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public GroceryItemDTO createGroceryItem(GroceryItemRequest request, UUID addedByUserId) {
        Optional<User> addedBy = userRepository.findById(addedByUserId);
        if (addedBy.isEmpty()) {
            throw new RuntimeException("User not found with id: " + addedByUserId);
        }

        GroceryItem item = new GroceryItem(request.name(), request.category(), request.quantity(), addedBy.get());
        item.setDescription(request.description());

        groceryItemRepository.save(item);
        return toDTO(item);
    }

    public GroceryItemDTO completeGroceryItem(UUID id, UUID completedByUserId) {
        Optional<GroceryItem> foundItem = groceryItemRepository.findById(id);
        if (foundItem.isEmpty()) {
            throw new RuntimeException("Grocery item not found with id: " + id);
        }

        Optional<User> completedBy = userRepository.findById(completedByUserId);
        if (completedBy.isEmpty()) {
            throw new RuntimeException("User not found with id: " + completedByUserId);
        }

        GroceryItem item = foundItem.get();
        item.setCompleted(true);
        item.setCompletedBy(completedBy.get());
        item.setCompletedAt(LocalDateTime.now());

        groceryItemRepository.save(item);
        return toDTO(item);
    }

    public GroceryItemDTO uncompleteGroceryItem(UUID id) {
        Optional<GroceryItem> foundItem = groceryItemRepository.findById(id);
        if (foundItem.isEmpty()) {
            throw new RuntimeException("Grocery item not found with id: " + id);
        }

        GroceryItem item = foundItem.get();
        item.setCompleted(false);
        item.setCompletedBy(null);
        item.setCompletedAt(null);

        groceryItemRepository.save(item);
        return toDTO(item);
    }

    public GroceryItemDTO updateGroceryItem(UUID id, GroceryItemRequest request) {
        Optional<GroceryItem> foundItem = groceryItemRepository.findById(id);
        if (foundItem.isEmpty()) {
            throw new RuntimeException("Grocery item not found with id: " + id);
        }

        GroceryItem item = foundItem.get();
        item.setName(request.name());
        item.setDescription(request.description());
        item.setCategory(request.category());
        item.setQuantity(request.quantity());

        groceryItemRepository.save(item);
        return toDTO(item);
    }

    public GroceryItemDTO findGroceryItemById(UUID id) {
        Optional<GroceryItem> foundItem = groceryItemRepository.findById(id);
        return foundItem.map(this::toDTO).orElse(null);
    }

    public List<GroceryItemDTO> getAllGroceryItems() {
        return groceryItemRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<GroceryItemDTO> getActiveGroceryItems() {
        return groceryItemRepository.findByIsCompletedFalseOrderByCreatedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<GroceryItemDTO> getCompletedGroceryItems() {
        return groceryItemRepository.findByIsCompletedTrueOrderByCompletedAtDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<GroceryItemDTO> getGroceryItemsByCategory(String category) {
        return groceryItemRepository.findByCategory(category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<String> getGroceryCategories() {
        return groceryItemRepository.findDistinctCategories();
    }

    public List<GroceryItemDTO> searchGroceryItems(String searchTerm) {
        return groceryItemRepository.findByNameOrDescriptionContainingIgnoreCase(searchTerm).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteGroceryItem(UUID id) {
        groceryItemRepository.deleteById(id);
    }
}