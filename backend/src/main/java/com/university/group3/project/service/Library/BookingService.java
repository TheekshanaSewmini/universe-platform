package com.university.group3.project.service.Library;

import com.university.group3.project.dtos.Library.BookSeatDTO;
import com.university.group3.project.dtos.Library.SeatSection;
import com.university.group3.project.entities.Library.SeatBooking;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public interface BookingService {

    String bookSeat(BookSeatDTO dto, UserDetails userDetails);

    void cancelBooking(UserDetails user, Long bookingId);

    List<SeatBooking> getAllBookings();

    List<SeatBooking> getMyBookings(UserDetails userDetails);

    String checkSeatAvailability(Integer seatNumber, SeatSection section, LocalDateTime start, LocalDateTime end);

    Map<String, List<Map<String, LocalTime>>> getSeatAvailabilityByDate(
            Integer seatNumber,
            SeatSection section,
            LocalDate date
    );

}
