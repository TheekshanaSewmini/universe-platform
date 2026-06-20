package com.university.group3.project.dtos.lostandfound;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.util.Date;

@Getter
@Setter
public class FoundItemDTO {
    private String itemName;
    private String description;
    private String foundPlace;
    private String publisherName;
    private String contactPhone;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private Date foundDate;
    private Year year;
    private Semester semester;
}
