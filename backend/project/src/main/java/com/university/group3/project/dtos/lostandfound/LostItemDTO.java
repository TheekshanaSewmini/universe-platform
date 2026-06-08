package com.university.group3.project.dtos.lostandfound;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LostItemDTO {
    private String itemName;
    private String description;
    private String lostPlace;
    private String contactName;
    private String contactPhone;
    private Year year;
    private Semester semester;
}
