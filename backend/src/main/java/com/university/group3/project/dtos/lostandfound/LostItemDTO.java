package com.university.group3.project.dtos.lostandfound;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Getter
@Setter
public class LostItemDTO {
    private String itemName;
    private String description;
    private String lostPlace;
    private String contactName;
    private String contactPhone;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private Date lostDate;
    private Year year;
    private Semester semester;
}
