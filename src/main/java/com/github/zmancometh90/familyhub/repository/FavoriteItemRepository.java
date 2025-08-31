package com.github.zmancometh90.familyhub.repository;

import com.github.zmancometh90.familyhub.models.FavoriteItem;
import com.github.zmancometh90.familyhub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoriteItemRepository extends JpaRepository<FavoriteItem, UUID> {

    // Only show favorites for the specific user (privacy requirement)
    List<FavoriteItem> findByUserOrderByNameAsc(User user);
    
    List<FavoriteItem> findByUserAndCategoryOrderByNameAsc(User user, String category);
    
    @Query("SELECT DISTINCT f.category FROM FavoriteItem f WHERE f.user = :user ORDER BY f.category")
    List<String> findDistinctCategoriesByUser(@Param("user") User user);
    
    @Query("SELECT f FROM FavoriteItem f WHERE f.user = :user AND (LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(f.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<FavoriteItem> findByUserAndNameOrDescriptionContainingIgnoreCase(@Param("user") User user, @Param("searchTerm") String searchTerm);
    
    // Check if user already has this exact favorite item
    Optional<FavoriteItem> findByUserAndNameIgnoreCaseAndCategoryIgnoreCase(User user, String name, String category);
}