package com.github.zmancometh90.familyhub.repository;

import com.github.zmancometh90.familyhub.models.GroceryItem;
import com.github.zmancometh90.familyhub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroceryItemRepository extends JpaRepository<GroceryItem, UUID> {

    List<GroceryItem> findByIsCompletedFalseOrderByCreatedAtDesc();
    
    List<GroceryItem> findByIsCompletedTrueOrderByCompletedAtDesc();
    
    List<GroceryItem> findByAddedBy(User user);
    
    List<GroceryItem> findByCompletedBy(User user);
    
    List<GroceryItem> findByCategory(String category);
    
    List<GroceryItem> findByCategoryAndIsCompleted(String category, boolean completed);
    
    @Query("SELECT DISTINCT g.category FROM GroceryItem g ORDER BY g.category")
    List<String> findDistinctCategories();
    
    @Query("SELECT g FROM GroceryItem g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(g.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<GroceryItem> findByNameOrDescriptionContainingIgnoreCase(@Param("searchTerm") String searchTerm);
    
    List<GroceryItem> findByCompletedAtBetween(LocalDateTime start, LocalDateTime end);
}