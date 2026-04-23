package com.university.group3.project.service.Library;

import com.university.group3.project.dtos.Library.SeatDTO;
import com.university.group3.project.entities.Library.Seat;
import com.university.group3.project.repos.Library.SeatBookingRepository;
import com.university.group3.project.repos.Library.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository seatRepository;
    private final SeatBookingRepository bookingRepository;

    @Override
    public SeatDTO addSeat(SeatDTO dto) {

        boolean exists = seatRepository.findBySeatNumberAndSection(dto.getSeatNumber(), dto.getSection()).isPresent();


        if (exists) {
            throw new RuntimeException("Seat number already exists in this section");
        }

        Seat seat = Seat.builder()
                .seatNumber(dto.getSeatNumber())
                .section(dto.getSection())
                .booked(false)
                .build();

        seatRepository.save(seat);

        dto.setId(seat.getId());
        dto.setBooked(false);

        return dto;
    }
    @Override
    public SeatDTO updateSeat(Long seatId, SeatDTO dto) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        seat.setSeatNumber(dto.getSeatNumber());
        seat.setSection(dto.getSection());
        seatRepository.save(seat);

        // Map back to DTO including the id
        SeatDTO updated = new SeatDTO();
        updated.setId(seat.getId());
        updated.setSeatNumber(seat.getSeatNumber());
        updated.setSection(seat.getSection());
        return updated;
    }

    @Override
    @Transactional
    public void deleteSeat(Long seatId) {
        if (!seatRepository.existsById(seatId)) {
            throw new RuntimeException("Seat not found");
        }
        bookingRepository.deleteBySeatId(seatId);
        seatRepository.deleteById(seatId);
    }

    @Override
    public List<SeatDTO> getAllSeats() {
        LocalDateTime now = LocalDateTime.now();


        var activeBookings = bookingRepository.findAll().stream()
                .filter(b -> b.isActive() && !b.getEndTime().isBefore(now) && !b.getStartTime().isAfter(now))
                .map(b -> b.getSeat().getId())
                .collect(Collectors.toSet());

        return seatRepository.findAll().stream().map(seat -> {
            SeatDTO dto = new SeatDTO();
            dto.setId(seat.getId());
            dto.setSeatNumber(seat.getSeatNumber());
            dto.setSection(seat.getSection());
            dto.setBooked(activeBookings.contains(seat.getId())); // check against precomputed set
            return dto;
        }).toList();
    }

    @Override
    public SeatDTO getSeatById(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        SeatDTO dto = new SeatDTO();
        dto.setId(seat.getId());
        dto.setSeatNumber(seat.getSeatNumber());
        dto.setSection(seat.getSection());
        return dto;
    }
}

