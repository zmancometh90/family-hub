package com.github.zmancometh90.familyhub.models;

public record FavoriteItemRequest(
        String name,
        String description,
        String category,
        Integer defaultQuantity
) {
}