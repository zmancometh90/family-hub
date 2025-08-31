package com.github.zmancometh90.familyhub.models;

public record UserRequest(
        String username,
        String password,
        String name,
        User.Role role
) {
}
