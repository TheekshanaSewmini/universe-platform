package com.university.group3.project.dtos.materials;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubjectDTO {
    private String  name;
    private String code;
    private String description;
    private Long courseId;
}
