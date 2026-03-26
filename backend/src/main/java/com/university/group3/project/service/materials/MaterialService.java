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

    Course createCourse(CourseDTO dto, User user);
    Course updateCourse(Long id, CourseDTO dto, User user);
    void deleteCourse(Long id, User user);
    List<Course> getCourses();
    Course getCourse(Long id);
    List<Course> getMyCourses(User user);

    Subject createSubject(SubjectDTO dto, User user);
    Subject updateSubject(Long id, SubjectDTO dto, User user);
    void deleteSubject(Long id, User user);
    List<Subject> getSubjects(Long courseId);
    Subject getSubject(Long id);
    List<Subject> getMySubjects(Long courseId, User user);

    Material createMaterial(MaterialDTO dto, MultipartFile file, User user);
    Material updateMaterial(Long id, MaterialDTO dto, User user);
    void deleteMaterial(Long id, User user);
    Material getMaterial(Long id, User user);
    List<Material> getMaterials(Long subjectId, Long courseId, User user);
    List<Material> getMyMaterials(Long subjectId, Long courseId, User user);

    MaterialVersion addVersion(Long materialId, String notes, MultipartFile file, User user);
    List<MaterialVersion> getVersions(Long materialId, User user);
    MaterialVersion getLatestVersion(Long materialId, User user);
}
