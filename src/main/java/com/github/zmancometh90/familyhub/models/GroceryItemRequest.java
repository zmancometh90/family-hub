package com.github.zmancometh90.familyhub.models;

public record GroceryItemRequest(
        String name,
        String description,
        String category,
        Integer quantity
) {
}