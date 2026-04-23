package com.university.group3.project.dtos.Library;

import lombok.Data;

@Data
public class SeatDTO {

    private Long id;
    private Integer seatNumber;
    private SeatSection section;

    private boolean booked;
}