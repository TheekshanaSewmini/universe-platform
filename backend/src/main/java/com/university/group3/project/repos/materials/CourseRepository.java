package com.university.group3.project.repos.materials;

import com.university.group3.project.entities.materials.Course;
import com.university.group3.project.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByOwner(User owner);
}
