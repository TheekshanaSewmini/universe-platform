package com.university.group3.project.dtos.Library;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookSeatDTO {

    private Integer seatNumber;
    private SeatSection section;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String passKey;



}
