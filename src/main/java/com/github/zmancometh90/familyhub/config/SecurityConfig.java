package com.github.zmancometh90.familyhub.config;

import com.github.zmancometh90.familyhub.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // H2 Console access (only for development)
                        .requestMatchers("/h2-console/**").permitAll()

                        // User endpoints - ADMIN can do everything, BASIC_USER has limited access
                        .requestMatchers(HttpMethod.POST, "/api/v1/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/me").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/{id}").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/users/{id}").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/users/{id}").hasRole("ADMIN")
                        .requestMatchers("/api/v1/users/search").hasRole("ADMIN")

                        // Event endpoints - Both roles can manage events
                        .requestMatchers("/api/v1/events/**").hasAnyRole("ADMIN", "BASIC_USER")

                        // Chorestation endpoints - Only ADMIN can manage chores
                        .requestMatchers(HttpMethod.GET, "/api/v1/chores/").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/chores/status/{status}").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/chores/date-range").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/chores/overdue").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/chores/{id}").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/chores/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/chores/{id}/status").hasAnyRole("ADMIN", "BASIC_USER")
                        .requestMatchers(HttpMethod.POST,"/api/v1/chores/").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/v1/chores/{id}").hasRole("ADMIN")

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> {
                })
                .headers(headers -> headers
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)); // Allow frames from same origin for H2

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}