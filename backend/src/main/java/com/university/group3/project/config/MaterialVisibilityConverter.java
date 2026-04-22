package com.university.group3.project.config;

import com.university.group3.project.dtos.materials.MaterialVisibility;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class MaterialVisibilityConverter implements Converter<String, MaterialVisibility> {
    @Override
    public MaterialVisibility convert(String source) {
        if (source == null || source.isBlank()) {
            return null;
        }
        return MaterialVisibility.valueOf(source.trim().toUpperCase());
    }
}
