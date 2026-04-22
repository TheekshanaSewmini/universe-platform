package com.university.group3.project.entities.Library;

import com.university.group3.project.entities.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Seat seat;

    @ManyToOne
    private User student;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private boolean active;

    @Column(unique = true)
    private String passKey;
}

