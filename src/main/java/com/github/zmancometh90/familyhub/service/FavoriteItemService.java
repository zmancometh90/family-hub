package com.github.zmancometh90.familyhub.service;

import com.github.zmancometh90.familyhub.models.*;
import com.github.zmancometh90.familyhub.repository.FavoriteItemRepository;
import com.github.zmancometh90.familyhub.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FavoriteItemService {
    
    private final FavoriteItemRepository favoriteItemRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public FavoriteItemService(FavoriteItemRepository favoriteItemRepository, UserRepository userRepository, UserService userService) {
        this.favoriteItemRepository = favoriteItemRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    private FavoriteItemDTO toDTO(FavoriteItem item) {
        UserDTO userDTO = userService.findUserById(item.getUser().getId());

        return new FavoriteItemDTO(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getCategory(),
                item.getDefaultQuantity(),
                userDTO,
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }

    public FavoriteItemDTO createFavoriteItem(FavoriteItemRequest request, UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        // Check if user already has this favorite item
        Optional<FavoriteItem> existing = favoriteItemRepository.findByUserAndNameIgnoreCaseAndCategoryIgnoreCase(
                user.get(), request.name(), request.category());
        if (existing.isPresent()) {
            throw new RuntimeException("Favorite item already exists: " + request.name() + " in category " + request.category());
        }

        FavoriteItem item = new FavoriteItem(request.name(), request.category(), request.defaultQuantity(), user.get());
        item.setDescription(request.description());

        favoriteItemRepository.save(item);
        return toDTO(item);
    }

    public FavoriteItemDTO updateFavoriteItem(UUID id, FavoriteItemRequest request, UUID userId) {
        Optional<FavoriteItem> foundItem = favoriteItemRepository.findById(id);
        if (foundItem.isEmpty()) {
            throw new RuntimeException("Favorite item not found with id: " + id);
        }

        FavoriteItem item = foundItem.get();
        
        // Ensure user can only update their own favorites
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own favorite items");
        }

        item.setName(request.name());
        item.setDescription(request.description());
        item.setCategory(request.category());
        item.setDefaultQuantity(request.defaultQuantity());

        favoriteItemRepository.save(item);
        return toDTO(item);
    }

    public FavoriteItemDTO findFavoriteItemById(UUID id, UUID userId) {
        Optional<FavoriteItem> foundItem = favoriteItemRepository.findById(id);
        if (foundItem.isEmpty()) {
            return null;
        }

        FavoriteItem item = foundItem.get();
        
        // Ensure user can only see their own favorites
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only view your own favorite items");
        }

        return toDTO(item);
    }

    // Only return favorites for the specific user
    public List<FavoriteItemDTO> getUserFavoriteItems(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        return favoriteItemRepository.findByUserOrderByNameAsc(user.get()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<FavoriteItemDTO> getUserFavoriteItemsByCategory(UUID userId, String category) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        return favoriteItemRepository.findByUserAndCategoryOrderByNameAsc(user.get(), category).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<String> getUserFavoriteCategories(UUID userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        return favoriteItemRepository.findDistinctCategoriesByUser(user.get());
    }

    public List<FavoriteItemDTO> searchUserFavoriteItems(UUID userId, String searchTerm) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        return favoriteItemRepository.findByUserAndNameOrDescriptionContainingIgnoreCase(user.get(), searchTerm).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void deleteFavoriteItem(UUID id, UUID userId) {
        Optional<FavoriteItem> foundItem = favoriteItemRepository.findById(id);
        if (foundItem.isEmpty()) {
            throw new RuntimeException("Favorite item not found with id: " + id);
        }

        FavoriteItem item = foundItem.get();
        
        // Ensure user can only delete their own favorites
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own favorite items");
        }

        favoriteItemRepository.deleteById(id);
    }
}