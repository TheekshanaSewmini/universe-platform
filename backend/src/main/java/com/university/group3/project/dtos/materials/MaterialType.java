package com.university.group3.project.dtos.materials;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum MaterialType {
     NOTE,
    PDF,
    VIDEO,
    OTHER;

    @JsonCreator
    public static MaterialType fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return MaterialType.valueOf(value.trim().toUpperCase());
    }
}
