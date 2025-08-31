package com.github.zmancometh90.familyhub.repository;

import com.github.zmancometh90.familyhub.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByName(String name);
    
    Optional<User> findByUsername(String username);
    
    boolean existsByUsername(String username);
}
