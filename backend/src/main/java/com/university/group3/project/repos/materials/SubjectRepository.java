package com.university.group3.project.repos.materials;

import com.university.group3.project.entities.materials.Course;
import com.university.group3.project.entities.materials.Subject;
import com.university.group3.project.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByCourse(Course course);
    List<Subject> findByOwner(User owner);
    List<Subject> findByOwnerAndCourse(User owner, Course course);
}
