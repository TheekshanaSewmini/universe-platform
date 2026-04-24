package com.university.group3.project.entities.lostandfound;

import com.university.group3.project.dtos.lostandfound.Semester;
import com.university.group3.project.dtos.lostandfound.Year;
import com.university.group3.project.entities.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "lost_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;
    private String description;
    private String lostPlace;
    private String imageUrl;

    private String contactName;
    private String contactPhone;

    @Temporal(TemporalType.DATE)
    private Date lostDate;

    @Enumerated(EnumType.STRING)
    private Year year;

    @Enumerated(EnumType.STRING)
    private Semester semester;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Date createdAt;
}
