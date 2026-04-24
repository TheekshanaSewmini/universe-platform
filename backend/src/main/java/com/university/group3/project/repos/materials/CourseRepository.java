package com.university.group3.project.repos.materials;

import com.university.group3.project.entities.User;
import com.university.group3.project.entities.materials.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    // Get all courses by a specific user (owner)
    List<Course> findAllByOwner(User owner);

}