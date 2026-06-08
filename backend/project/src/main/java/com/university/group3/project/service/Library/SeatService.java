package com.university.group3.project.service.Library;

import com.university.group3.project.dtos.Library.SeatDTO;

import java.util.List;

public interface SeatService {

    SeatDTO addSeat(SeatDTO dto);

    SeatDTO updateSeat(Long seatId, SeatDTO dto);

    void deleteSeat(Long seatId);

    List<SeatDTO> getAllSeats();

    SeatDTO getSeatById(Long seatId);
}

