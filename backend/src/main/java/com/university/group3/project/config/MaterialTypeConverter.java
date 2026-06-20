package com.university.group3.project.config;

import com.university.group3.project.dtos.materials.MaterialType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class MaterialTypeConverter implements Converter<String, MaterialType> {
    @Override
    public MaterialType convert(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        return MaterialType.valueOf(source.trim().toUpperCase());
    }
}



