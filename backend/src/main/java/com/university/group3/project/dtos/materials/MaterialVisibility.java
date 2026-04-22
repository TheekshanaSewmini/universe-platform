package com.university.group3.project.dtos.materials;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum MaterialVisibility {
    PUBLIC,
    PRIVATE;

    @JsonCreator
    public static MaterialVisibility fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return MaterialVisibility.valueOf(value.trim().toUpperCase());
    }
}
