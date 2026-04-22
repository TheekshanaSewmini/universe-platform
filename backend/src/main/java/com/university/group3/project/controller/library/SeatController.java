package com.university.group3.project.controller.library;

import com.university.group3.project.dtos.Library.SeatDTO;
import com.university.group3.project.service.Library.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/librarian/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @PreAuthorize("hasRole('ROLE_LIBRARIAN')")
    @PostMapping("/craete")
    public SeatDTO addSeat(@RequestBody SeatDTO dto) {

        return seatService.addSeat(dto);

    }

    @PreAuthorize("hasRole('ROLE_LIBRARIAN')")
    @PutMapping("/{seatId}")
    public SeatDTO updateSeat(@PathVariable Long seatId,
                              @RequestBody SeatDTO dto) {
        return seatService.updateSeat(seatId, dto);
    }

    @GetMapping("all")
    public List<SeatDTO> getAllSeats() {
        return seatService.getAllSeats();
    }

    @PreAuthorize("hasRole('ROLE_LIBRARIAN')")
    @DeleteMapping("/{seatId}")
    public ResponseEntity<String> deleteSeat(@PathVariable Long seatId) {
        seatService.deleteSeat(seatId);
        return ResponseEntity.ok("Seat deleted successfully");
    }


    @PreAuthorize("hasRole('ROLE_LIBRARIAN') or hasRole('ROLE_ADMIN')")
    @GetMapping("/{seatId}")
    public ResponseEntity<SeatDTO> getSeatById(@PathVariable Long seatId) {
        SeatDTO seat = seatService.getSeatById(seatId);
        return ResponseEntity.ok(seat);
    }
}

