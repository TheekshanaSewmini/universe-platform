package com.university.group3.project.entities.materials;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.university.group3.project.entities.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "material_versions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "material_id")
    @JsonIgnore
    private Material material;

    @Column(nullable = false)
    private Integer versionNumber;

    @Column(nullable = false, length = 500)
    private String fileUrl;

    @Column(length = 300)
    private String originalFilename;

    @Column(length = 100)
    private String contentType;

    private Long fileSize;

    @Column(length = 1000)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    private Date uploadedAt;
}
