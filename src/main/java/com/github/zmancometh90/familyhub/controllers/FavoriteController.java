package com.github.zmancometh90.familyhub.controllers;

import com.github.zmancometh90.familyhub.models.ApiResponse;
import com.github.zmancometh90.familyhub.models.FavoriteItemDTO;
import com.github.zmancometh90.familyhub.models.FavoriteItemRequest;
import com.github.zmancometh90.familyhub.service.FavoriteItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {
    
    private final FavoriteItemService favoriteItemService;

    public FavoriteController(FavoriteItemService favoriteItemService) {
        this.favoriteItemService = favoriteItemService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FavoriteItemDTO>> createFavoriteItem(
            @RequestBody FavoriteItemRequest request,
            @RequestParam UUID userId) {
        ApiResponse<FavoriteItemDTO> response = new ApiResponse<>();
        try {
            FavoriteItemDTO favoriteItem = favoriteItemService.createFavoriteItem(request, userId);
            response.setData(favoriteItem);
            response.setMessage("Favorite item created successfully");
            response.setSuccess(true);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<FavoriteItemDTO>>> getUserFavoriteItems(@PathVariable UUID userId) {
        ApiResponse<List<FavoriteItemDTO>> response = new ApiResponse<>();
        try {
            List<FavoriteItemDTO> items = favoriteItemService.getUserFavoriteItems(userId);
            response.setData(items);
            response.setMessage("User favorite items retrieved successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FavoriteItemDTO>> getFavoriteItemById(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        ApiResponse<FavoriteItemDTO> response = new ApiResponse<>();
        try {
            FavoriteItemDTO item = favoriteItemService.findFavoriteItemById(id, userId);
            
            if (item == null) {
                response.setData(null);
                response.setMessage("Favorite item not found");
                response.setSuccess(false);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            response.setData(item);
            response.setMessage("Favorite item found successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FavoriteItemDTO>> updateFavoriteItem(
            @PathVariable UUID id,
            @RequestBody FavoriteItemRequest request,
            @RequestParam UUID userId) {
        ApiResponse<FavoriteItemDTO> response = new ApiResponse<>();
        try {
            FavoriteItemDTO updatedItem = favoriteItemService.updateFavoriteItem(id, request, userId);
            response.setData(updatedItem);
            response.setMessage("Favorite item updated successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/user/{userId}/categories")
    public ResponseEntity<ApiResponse<List<String>>> getUserFavoriteCategories(@PathVariable UUID userId) {
        ApiResponse<List<String>> response = new ApiResponse<>();
        try {
            List<String> categories = favoriteItemService.getUserFavoriteCategories(userId);
            response.setData(categories);
            response.setMessage("User favorite categories retrieved successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<ApiResponse<List<FavoriteItemDTO>>> getUserFavoriteItemsByCategory(
            @PathVariable UUID userId,
            @PathVariable String category) {
        ApiResponse<List<FavoriteItemDTO>> response = new ApiResponse<>();
        try {
            List<FavoriteItemDTO> items = favoriteItemService.getUserFavoriteItemsByCategory(userId, category);
            response.setData(items);
            response.setMessage("User favorite items by category retrieved successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<ApiResponse<List<FavoriteItemDTO>>> searchUserFavoriteItems(
            @PathVariable UUID userId,
            @RequestParam String searchTerm) {
        ApiResponse<List<FavoriteItemDTO>> response = new ApiResponse<>();
        try {
            List<FavoriteItemDTO> items = favoriteItemService.searchUserFavoriteItems(userId, searchTerm);
            response.setData(items);
            response.setMessage("User favorite items search completed successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFavoriteItem(
            @PathVariable UUID id,
            @RequestParam UUID userId) {
        ApiResponse<Void> response = new ApiResponse<>();
        try {
            favoriteItemService.deleteFavoriteItem(id, userId);
            response.setData(null);
            response.setMessage("Favorite item deleted successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}