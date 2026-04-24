package com.university.group3.project.service.materials;

import com.university.group3.project.dtos.materials.CourseDTO;
import com.university.group3.project.dtos.materials.MaterialDTO;
import com.university.group3.project.dtos.materials.SubjectDTO;
import com.university.group3.project.entities.User;
import com.university.group3.project.entities.materials.Course;
import com.university.group3.project.entities.materials.Material;
import com.university.group3.project.entities.materials.MaterialVersion;
import com.university.group3.project.entities.materials.Subject;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MaterialService {

    // Course
    Course createCourse(CourseDTO courseDTO, User loggedUser);

    Course updateCourse(Long courseId, CourseDTO courseDTO, User loggedUser);

    void deleteCourse(Long courseId, User loggedUser);

    Course getCourse(Long courseId);

    List<Course> getCourses();

    List<Course> getMyCourses(User loggedUser);


    // Subject
    Subject createSubject(SubjectDTO subjectDTO, User loggedUser);

    Subject updateSubject(Long subjectId, SubjectDTO subjectDTO, User loggedUser);

    void deleteSubject(Long subjectId, User loggedUser);

    Subject getSubject(Long subjectId);

    List<Subject> getSubjects(Long courseId);

    List<Subject> getMySubjects(Long courseId, User loggedUser);


    // Material
    Material createMaterial(MaterialDTO materialDTO, MultipartFile file, User loggedUser);

    Material updateMaterial(Long materialId, MaterialDTO materialDTO, User loggedUser);

    void deleteMaterial(Long materialId, User loggedUser);

    Material getMaterial(Long materialId, User loggedUser);

    List<Material> getMaterials(Long subjectId, Long courseId, User loggedUser);

    List<Material> getMyMaterials(Long subjectId, Long courseId, User loggedUser);


    // Material Version
    MaterialVersion addVersion(Long materialId, String notes, MultipartFile file, User loggedUser);

    List<MaterialVersion> getVersions(Long materialId, User loggedUser);

    MaterialVersion getLatestVersion(Long materialId, User loggedUser);
}