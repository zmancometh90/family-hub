package com.github.zmancometh90.familyhub.controllers;

import com.github.zmancometh90.familyhub.models.ApiResponse;
import com.github.zmancometh90.familyhub.models.GroceryItemDTO;
import com.github.zmancometh90.familyhub.models.GroceryItemRequest;
import com.github.zmancometh90.familyhub.service.GroceryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/grocery")
public class GroceryController {
    
    private final GroceryService groceryService;

    public GroceryController(GroceryService groceryService) {
        this.groceryService = groceryService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroceryItemDTO>> createGroceryItem(
            @RequestBody GroceryItemRequest request,
            @RequestParam UUID addedByUserId) {
        ApiResponse<GroceryItemDTO> response = new ApiResponse<>();
        try {
            GroceryItemDTO groceryItem = groceryService.createGroceryItem(request, addedByUserId);
            response.setData(groceryItem);
            response.setMessage("Grocery item created successfully");
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
    public ResponseEntity<ApiResponse<List<GroceryItemDTO>>> getAllGroceryItems() {
        ApiResponse<List<GroceryItemDTO>> response = new ApiResponse<>();
        List<GroceryItemDTO> items = groceryService.getAllGroceryItems();
        response.setData(items);
        response.setMessage("Grocery items retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<GroceryItemDTO>>> getActiveGroceryItems() {
        ApiResponse<List<GroceryItemDTO>> response = new ApiResponse<>();
        List<GroceryItemDTO> items = groceryService.getActiveGroceryItems();
        response.setData(items);
        response.setMessage("Active grocery items retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/completed")
    public ResponseEntity<ApiResponse<List<GroceryItemDTO>>> getCompletedGroceryItems() {
        ApiResponse<List<GroceryItemDTO>> response = new ApiResponse<>();
        List<GroceryItemDTO> items = groceryService.getCompletedGroceryItems();
        response.setData(items);
        response.setMessage("Completed grocery items retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroceryItemDTO>> getGroceryItemById(@PathVariable UUID id) {
        ApiResponse<GroceryItemDTO> response = new ApiResponse<>();
        GroceryItemDTO item = groceryService.findGroceryItemById(id);
        
        if (item == null) {
            response.setData(null);
            response.setMessage("Grocery item not found");
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.setData(item);
        response.setMessage("Grocery item found successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GroceryItemDTO>> updateGroceryItem(
            @PathVariable UUID id,
            @RequestBody GroceryItemRequest request) {
        ApiResponse<GroceryItemDTO> response = new ApiResponse<>();
        try {
            GroceryItemDTO updatedItem = groceryService.updateGroceryItem(id, request);
            response.setData(updatedItem);
            response.setMessage("Grocery item updated successfully");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<GroceryItemDTO>> completeGroceryItem(
            @PathVariable UUID id,
            @RequestParam UUID completedByUserId) {
        ApiResponse<GroceryItemDTO> response = new ApiResponse<>();
        try {
            GroceryItemDTO completedItem = groceryService.completeGroceryItem(id, completedByUserId);
            response.setData(completedItem);
            response.setMessage("Grocery item marked as completed");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PutMapping("/{id}/uncomplete")
    public ResponseEntity<ApiResponse<GroceryItemDTO>> uncompleteGroceryItem(@PathVariable UUID id) {
        ApiResponse<GroceryItemDTO> response = new ApiResponse<>();
        try {
            GroceryItemDTO uncompletedItem = groceryService.uncompleteGroceryItem(id);
            response.setData(uncompletedItem);
            response.setMessage("Grocery item marked as active");
            response.setSuccess(true);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.setData(null);
            response.setMessage(e.getMessage());
            response.setSuccess(false);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getGroceryCategories() {
        ApiResponse<List<String>> response = new ApiResponse<>();
        List<String> categories = groceryService.getGroceryCategories();
        response.setData(categories);
        response.setMessage("Grocery categories retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<GroceryItemDTO>>> getGroceryItemsByCategory(@PathVariable String category) {
        ApiResponse<List<GroceryItemDTO>> response = new ApiResponse<>();
        List<GroceryItemDTO> items = groceryService.getGroceryItemsByCategory(category);
        response.setData(items);
        response.setMessage("Grocery items by category retrieved successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<GroceryItemDTO>>> searchGroceryItems(@RequestParam String searchTerm) {
        ApiResponse<List<GroceryItemDTO>> response = new ApiResponse<>();
        List<GroceryItemDTO> items = groceryService.searchGroceryItems(searchTerm);
        response.setData(items);
        response.setMessage("Grocery items search completed successfully");
        response.setSuccess(true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroceryItem(@PathVariable UUID id) {
        ApiResponse<Void> response = new ApiResponse<>();
        try {
            groceryService.deleteGroceryItem(id);
            response.setData(null);
            response.setMessage("Grocery item deleted successfully");
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