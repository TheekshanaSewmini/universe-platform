package com.university.group3.project.controller.library;

import com.university.group3.project.dtos.Library.BookSeatDTO;
import com.university.group3.project.dtos.Library.SeatDTO;
import com.university.group3.project.dtos.Library.SeatSection;
import com.university.group3.project.repos.Library.SeatRepository;
import com.university.group3.project.service.Library.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final SeatRepository seatRepository;

    @PostMapping("/book")
    public String bookSeat(@RequestBody BookSeatDTO dto,
                           @AuthenticationPrincipal UserDetails user) {
        return bookingService.bookSeat(dto, user);
    }

    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_LIBRARIAN')")
    @DeleteMapping("/cancel/{bookingId}")
    public void cancelBooking(
            @PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails user) {
        bookingService.cancelBooking(user, bookingId);
    }


    @GetMapping("/all")
    public List<?> getAllBookings(@AuthenticationPrincipal UserDetails user) {
        boolean isLibrarian = user.getAuthorities()
                .stream()
                .anyMatch(a ->
                        a.getAuthority().equals("ROLE_LIBRARIAN") ||
                                a.getAuthority().equals("ROLE_ADMIN")
                );

        if (!isLibrarian) {
            throw new RuntimeException("Access denied");
        }
        return bookingService.getAllBookings();
    }


    @GetMapping("/my")
    public List<?> getMyBookings(@AuthenticationPrincipal UserDetails user) {
        return bookingService.getMyBookings(user);
    }




    @GetMapping("/check")
    public ResponseEntity<String> checkAvailability(
            @RequestParam Integer seatNumber,
            @RequestParam SeatSection section,
            @RequestParam String start,
            @RequestParam String end
    ) {
        LocalDateTime startTime = LocalDateTime.parse(start);
        LocalDateTime endTime = LocalDateTime.parse(end);

        // Call service by seat number + section
        String message = bookingService.checkSeatAvailability(seatNumber, section, startTime, endTime);

        return ResponseEntity.ok(message);
    }

    @GetMapping("/seat/availability")
    public ResponseEntity<Map<String, List<Map<String, LocalTime>>>> getSeatAvailability(
            @RequestParam Integer seatNumber,
            @RequestParam SeatSection section,
            @RequestParam String date // "2026-03-24"
    ) {
        LocalDate localDate = LocalDate.parse(date);
        Map<String, List<Map<String, LocalTime>>> result =
                bookingService.getSeatAvailabilityByDate(seatNumber, section, localDate);

        return ResponseEntity.ok(result);
    }
}
