package com.github.zmancometh90.familyhub.config;

import com.github.zmancometh90.familyhub.models.User;
import com.github.zmancometh90.familyhub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if it doesn't exist. Only for development purposes.
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                "admin",
                passwordEncoder.encode("admin"),
                "Administrator",
                User.Role.ADMIN
            );
            userRepository.save(admin);
            System.out.println("Default admin user created with username: admin, password: admin");
        }
    }
}