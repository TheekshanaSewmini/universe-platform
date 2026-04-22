package com.university.group3.project.repos.Library;

import com.university.group3.project.entities.Library.SeatBooking;
import com.university.group3.project.entities.Library.Seat;
import com.university.group3.project.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SeatBookingRepository extends JpaRepository<SeatBooking, Long> {

    Optional<SeatBooking> findByStudentAndActiveTrue(User student);

    List<SeatBooking> findByStudent(User student);

    boolean existsBySeatAndActiveTrueAndEndTimeAfterAndStartTimeBefore(
            Seat seat, LocalDateTime start, LocalDateTime end
    );

    List<SeatBooking> findBySeatAndActiveTrueAndEndTimeAfterAndStartTimeBefore(
            Seat seat, LocalDateTime start, LocalDateTime end
    );
        void deleteBySeatId(Long seatId);
}