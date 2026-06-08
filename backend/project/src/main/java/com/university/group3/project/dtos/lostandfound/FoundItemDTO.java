package com.university.group3.project.dtos.lostandfound;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FoundItemDTO {
    private String itemName;
    private String description;
    private String foundPlace;
    private String publisherName;
    private String contactPhone;
    private Year year;
    private Semester semester;
}
