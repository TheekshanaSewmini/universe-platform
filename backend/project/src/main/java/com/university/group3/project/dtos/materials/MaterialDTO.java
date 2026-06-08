package com.university.group3.project.dtos.materials;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialDTO {
    private String title;
    private String description;
    private MaterialType type;
    private Long subjectId;
}
