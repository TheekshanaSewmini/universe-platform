package com.university.group3.project.repos.Library;

import com.university.group3.project.dtos.Library.SeatSection;
import com.university.group3.project.entities.Library.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    Optional<Seat> findBySeatNumber(Integer seatNumber);
    Optional<Seat> findBySeatNumberAndSection(Integer seatNumber, SeatSection section);

}
