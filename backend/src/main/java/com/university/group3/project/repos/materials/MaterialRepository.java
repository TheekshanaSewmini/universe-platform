package com.university.group3.project.repos.materials;

import com.university.group3.project.entities.User;
import com.university.group3.project.entities.materials.Course;
import com.university.group3.project.entities.materials.Material;
import com.university.group3.project.entities.materials.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findBySubject(Subject subject);
    List<Material> findBySubjectCourse(Course course);
    List<Material> findByOwner(User owner);
    List<Material> findByOwnerAndSubject(User owner, Subject subject);
    List<Material> findByOwnerAndSubjectCourse(User owner, Course course);
}
