package com.university.group3.project.service.Library;

import com.university.group3.project.dtos.Library.BookSeatDTO;
import com.university.group3.project.dtos.Library.SeatSection;
import com.university.group3.project.entities.Library.Seat;
import com.university.group3.project.entities.Library.SeatBooking;
import com.university.group3.project.repos.Library.SeatBookingRepository;
import com.university.group3.project.repos.Library.SeatRepository;
import com.university.group3.project.repos.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final SeatRepository seatRepository;
    private final SeatBookingRepository bookingRepository;
    private final UserRepo userRepository;

    @Override
    public String bookSeat(BookSeatDTO dto, UserDetails userDetails) {
        var student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));


        Seat seat = seatRepository.findBySeatNumberAndSection(dto.getSeatNumber(), dto.getSection())
                .orElseThrow(() -> new RuntimeException("Seat not found in section " + dto.getSection()));

        LocalDateTime start = dto.getStartTime();
        LocalDateTime end = dto.getEndTime();

        if (!end.isAfter(start)) return "End time must be after start time";
        if (Duration.between(start, end).toHours() > 2) return "Maximum booking duration is 2 hours";


        boolean overlap = bookingRepository.existsBySeatAndActiveTrueAndEndTimeAfterAndStartTimeBefore(
                seat, start, end
        );

        if (overlap) {
            List<SeatBooking> bookings = bookingRepository.findBySeatAndActiveTrueAndEndTimeAfterAndStartTimeBefore(
                    seat, start, end
            );
            StringBuilder message = new StringBuilder("Seat is already booked during: ");
            bookings.forEach(b -> message.append("[").append(b.getStartTime())
                    .append(" to ").append(b.getEndTime()).append("] "));
            return message.toString();
        }

        // Save booking
        String passKey = UUID.randomUUID().toString();
        SeatBooking booking = SeatBooking.builder()
                .seat(seat)
                .student(student)
                .startTime(start)
                .endTime(end)
                .active(true)
                .passKey(passKey)
                .build();

        bookingRepository.save(booking);

        return "Seat booked successfully! Pass key: " + passKey;
    }

    @Override
    public void cancelBooking(UserDetails user, Long bookingId) {
        SeatBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isLibrarian = user.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_LIBRARIAN"));

        if (!isLibrarian && !booking.getStudent().getUsername().equals(user.getUsername())) {
            throw new AccessDeniedException("You cannot cancel someone else's booking");
        }

        bookingRepository.delete(booking);
    }

    @Override
    public List<SeatBooking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public List<SeatBooking> getMyBookings(UserDetails userDetails) {
        var student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return bookingRepository.findByStudent(student);
    }

    @Override
    public String checkSeatAvailability(Integer seatNumber, SeatSection section, LocalDateTime start, LocalDateTime end) {
        Seat seat = seatRepository.findBySeatNumberAndSection(seatNumber, section)
                .orElseThrow(() -> new RuntimeException("Seat not found in section " + section));

        boolean overlap = bookingRepository.existsBySeatAndActiveTrueAndEndTimeAfterAndStartTimeBefore(
                seat, start, end
        );

        if (overlap) {
            List<SeatBooking> bookings = bookingRepository.findBySeatAndActiveTrueAndEndTimeAfterAndStartTimeBefore(
                    seat, start, end
            );
            StringBuilder message = new StringBuilder("Seat is already booked during: ");
            bookings.forEach(b -> message.append("[").append(b.getStartTime())
                    .append(" to ").append(b.getEndTime()).append("] "));
            return message.toString();
        }

        return "Seat is available for this time range";
    }

    @Override
    public Map<String, List<Map<String, LocalTime>>> getSeatAvailabilityByDate(
            Integer seatNumber,
            SeatSection section,
            LocalDate date
    ) {
        // Find seat by number and section
        var seat = seatRepository.findBySeatNumberAndSection(seatNumber, section)
                .orElseThrow(() -> new RuntimeException("Seat not found in section " + section));

        LocalDateTime now = LocalDateTime.now();

        // Start and end of the day
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(23, 59, 59);

        // Get all bookings for the seat on that date
        List<SeatBooking> bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getSeat().getId().equals(seat.getId()))
                .filter(b -> !b.getEndTime().isBefore(dayStart) && !b.getStartTime().isAfter(dayEnd))
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .toList();

        // Prepare booked periods
        List<Map<String, LocalTime>> bookedPeriods = bookings.stream()
                .map(b -> Map.of(
                        "start", b.getStartTime().toLocalTime(),
                        "end", b.getEndTime().toLocalTime()
                ))
                .toList();

        // Prepare available periods
        List<Map<String, LocalTime>> availablePeriods = new ArrayList<>();
        LocalDateTime cursor = dayStart.isAfter(now) ? dayStart : now; // don't include past time

        for (SeatBooking b : bookings) {
            if (b.getStartTime().isAfter(cursor)) {
                availablePeriods.add(Map.of(
                        "start", cursor.toLocalTime(),
                        "end", b.getStartTime().toLocalTime()
                ));
            }
            // Move cursor forward
            if (b.getEndTime().isAfter(cursor)) {
                cursor = b.getEndTime();
            }
        }

        // Remaining period until end of day
        if (cursor.isBefore(dayEnd)) {
            availablePeriods.add(Map.of(
                    "start", cursor.toLocalTime(),
                    "end", dayEnd.toLocalTime()
            ));
        }

        return Map.of(
                "bookedPeriods", bookedPeriods,
                "availablePeriods", availablePeriods
        );
    }


}
