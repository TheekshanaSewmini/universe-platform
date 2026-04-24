package com.university.group3.project.service.materials;

import com.university.group3.project.dtos.materials.CourseDTO;
import com.university.group3.project.dtos.materials.MaterialDTO;
import com.university.group3.project.dtos.materials.MaterialType;
import com.university.group3.project.dtos.materials.SubjectDTO;
import com.university.group3.project.entities.User;
import com.university.group3.project.entities.materials.Course;
import com.university.group3.project.entities.materials.Material;
import com.university.group3.project.entities.materials.MaterialVersion;
import com.university.group3.project.entities.materials.Subject;
import com.university.group3.project.repos.materials.CourseRepository;
import com.university.group3.project.repos.materials.MaterialRepository;
import com.university.group3.project.repos.materials.MaterialVersionRepository;
import com.university.group3.project.repos.materials.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private static final String UPLOAD_FOLDER = "uploads/materials/";
    private static final String FILE_ACCESS_PATH = "/uploads/materials/";

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final MaterialRepository materialRepository;
    private final MaterialVersionRepository materialVersionRepository;

    private void checkLogin(User user) {
        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }
    }

    private void checkOwnership(User owner, User loggedUser, Runnable setOwnerAction) {
        checkLogin(loggedUser);

        if (owner == null) {
            setOwnerAction.run();
            return;
        }

        if (!owner.getUserId().equals(loggedUser.getUserId())) {
            throw new RuntimeException("Access denied");
        }
    }

    private Material findMaterial(Long materialId) {
        return materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));
    }

    private Course findCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    private Subject findSubject(Long subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    private String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        try {
            Files.createDirectories(Paths.get(UPLOAD_FOLDER));

            String originalName = file.getOriginalFilename();
            String safeName = originalName == null ? "file" : originalName;
            String newFileName = System.currentTimeMillis() + "_" + safeName;

            Path filePath = Paths.get(UPLOAD_FOLDER + newFileName);
            Files.copy(file.getInputStream(), filePath);

            return FILE_ACCESS_PATH + newFileName;
        } catch (Exception e) {
            throw new RuntimeException("File upload failed");
        }
    }

    // ================= COURSES =================

    @Override
    public Course createCourse(CourseDTO courseDTO, User loggedUser) {
        checkLogin(loggedUser);

        if (courseDTO.getName() == null || courseDTO.getName().isBlank()) {
            throw new RuntimeException("Course name is required");
        }

        Course course = Course.builder()
                .name(courseDTO.getName())
                .code(courseDTO.getCode())
                .description(courseDTO.getDescription())
                .owner(loggedUser)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(Long courseId, CourseDTO courseDTO, User loggedUser) {
        Course course = findCourse(courseId);

        checkOwnership(course.getOwner(), loggedUser, () -> course.setOwner(loggedUser));

        if (courseDTO.getName() != null) {
            course.setName(courseDTO.getName());
        }

        if (courseDTO.getCode() != null) {
            course.setCode(courseDTO.getCode());
        }

        if (courseDTO.getDescription() != null) {
            course.setDescription(courseDTO.getDescription());
        }

        course.setUpdatedAt(new Date());
        return courseRepository.save(course);
    }

    @Override
    public void deleteCourse(Long courseId, User loggedUser) {
        Course course = findCourse(courseId);

        checkOwnership(course.getOwner(), loggedUser, () -> course.setOwner(loggedUser));

        courseRepository.delete(course);
    }

    @Override
    public List<Course> getCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course getCourse(Long courseId) {
        return findCourse(courseId);
    }

    @Override
    public List<Course> getMyCourses(User loggedUser) {
        checkLogin(loggedUser);
        return courseRepository.findByOwner(loggedUser);
    }

    // ================= SUBJECTS =================

    @Override
    public Subject createSubject(SubjectDTO subjectDTO, User loggedUser) {
        checkLogin(loggedUser);

        if (subjectDTO.getCourseId() == null) {
            throw new RuntimeException("Course is required");
        }

        if (subjectDTO.getName() == null || subjectDTO.getName().isBlank()) {
            throw new RuntimeException("Subject name is required");
        }

        Course course = findCourse(subjectDTO.getCourseId());

        Subject subject = Subject.builder()
                .name(subjectDTO.getName())
                .code(subjectDTO.getCode())
                .description(subjectDTO.getDescription())
                .course(course)
                .owner(loggedUser)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        return subjectRepository.save(subject);
    }

    @Override
    public Subject updateSubject(Long subjectId, SubjectDTO subjectDTO, User loggedUser) {
        Subject subject = findSubject(subjectId);

        checkOwnership(subject.getOwner(), loggedUser, () -> subject.setOwner(loggedUser));

        if (subjectDTO.getName() != null) {
            subject.setName(subjectDTO.getName());
        }

        if (subjectDTO.getCode() != null) {
            subject.setCode(subjectDTO.getCode());
        }

        if (subjectDTO.getDescription() != null) {
            subject.setDescription(subjectDTO.getDescription());
        }

        if (subjectDTO.getCourseId() != null) {
            Course course = findCourse(subjectDTO.getCourseId());
            subject.setCourse(course);
        }

        subject.setUpdatedAt(new Date());
        return subjectRepository.save(subject);
    }

    @Override
    public void deleteSubject(Long subjectId, User loggedUser) {
        Subject subject = findSubject(subjectId);

        checkOwnership(subject.getOwner(), loggedUser, () -> subject.setOwner(loggedUser));

        subjectRepository.delete(subject);
    }

    @Override
    public List<Subject> getSubjects(Long courseId) {
        if (courseId == null) {
            return subjectRepository.findAll();
        }

        Course course = findCourse(courseId);
        return subjectRepository.findByCourse(course);
    }

    @Override
    public Subject getSubject(Long subjectId) {
        return findSubject(subjectId);
    }

    @Override
    public List<Subject> getMySubjects(Long courseId, User loggedUser) {
        checkLogin(loggedUser);

        if (courseId == null) {
            return subjectRepository.findByOwner(loggedUser);
        }

        Course course = findCourse(courseId);
        return subjectRepository.findByOwnerAndCourse(loggedUser, course);
    }

    // ================= MATERIALS =================

    @Override
    public Material createMaterial(MaterialDTO materialDTO, MultipartFile file, User loggedUser) {
        checkLogin(loggedUser);

        if (materialDTO.getSubjectId() == null) {
            throw new RuntimeException("Subject is required");
        }

        if (materialDTO.getTitle() == null || materialDTO.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }

        Subject subject = findSubject(materialDTO.getSubjectId());

        MaterialType materialType = materialDTO.getType() == null
                ? MaterialType.OTHER
                : materialDTO.getType();

        Material material = Material.builder()
                .title(materialDTO.getTitle())
                .description(materialDTO.getDescription())
                .type(materialType)
                .subject(subject)
                .owner(loggedUser)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();

        Material savedMaterial = materialRepository.save(material);

        MaterialVersion firstVersion = MaterialVersion.builder()
                .material(savedMaterial)
                .versionNumber(1)
                .fileUrl(uploadFile(file))
                .originalFilename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(loggedUser)
                .uploadedAt(new Date())
                .build();

        materialVersionRepository.save(firstVersion);

        return savedMaterial;
    }

    @Override
    public Material updateMaterial(Long materialId, MaterialDTO materialDTO, User loggedUser) {
        Material material = findMaterial(materialId);

        checkOwnership(material.getOwner(), loggedUser, () -> material.setOwner(loggedUser));

        if (materialDTO.getTitle() != null) {
            material.setTitle(materialDTO.getTitle());
        }

        if (materialDTO.getDescription() != null) {
            material.setDescription(materialDTO.getDescription());
        }

        if (materialDTO.getType() != null) {
            material.setType(materialDTO.getType());
        }

        if (materialDTO.getSubjectId() != null) {
            Subject subject = findSubject(materialDTO.getSubjectId());
            material.setSubject(subject);
        }

        material.setUpdatedAt(new Date());
        return materialRepository.save(material);
    }

    @Override
    public void deleteMaterial(Long materialId, User loggedUser) {
        Material material = findMaterial(materialId);

        checkOwnership(material.getOwner(), loggedUser, () -> material.setOwner(loggedUser));

        materialVersionRepository.deleteByMaterial(material);
        materialRepository.delete(material);
    }

    @Override
    public Material getMaterial(Long materialId, User loggedUser) {
        return findMaterial(materialId);
    }

    @Override
    public List<Material> getMaterials(Long subjectId, Long courseId, User loggedUser) {
        if (subjectId != null) {
            Subject subject = findSubject(subjectId);
            return materialRepository.findBySubject(subject);
        }

        if (courseId != null) {
            Course course = findCourse(courseId);
            return materialRepository.findBySubjectCourse(course);
        }

        return materialRepository.findAll();
    }

    @Override
    public List<Material> getMyMaterials(Long subjectId, Long courseId, User loggedUser) {
        checkLogin(loggedUser);

        if (subjectId != null) {
            Subject subject = findSubject(subjectId);
            return materialRepository.findByOwnerAndSubject(loggedUser, subject);
        }

        if (courseId != null) {
            Course course = findCourse(courseId);
            return materialRepository.findByOwnerAndSubjectCourse(loggedUser, course);
        }

        return materialRepository.findByOwner(loggedUser);
    }

    // ================= MATERIAL VERSIONS =================

    @Override
    public MaterialVersion addVersion(Long materialId, String notes, MultipartFile file, User loggedUser) {
        Material material = findMaterial(materialId);

        checkOwnership(material.getOwner(), loggedUser, () -> material.setOwner(loggedUser));

        MaterialVersion latestVersion =
                materialVersionRepository.findTopByMaterialOrderByVersionNumberDesc(material);

        int newVersionNumber = latestVersion == null
                ? 1
                : latestVersion.getVersionNumber() + 1;

        MaterialVersion newVersion = MaterialVersion.builder()
                .material(material)
                .versionNumber(newVersionNumber)
                .fileUrl(uploadFile(file))
                .originalFilename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .notes(notes)
                .uploadedBy(loggedUser)
                .uploadedAt(new Date())
                .build();

        material.setUpdatedAt(new Date());
        materialRepository.save(material);

        return materialVersionRepository.save(newVersion);
    }

    @Override
    public List<MaterialVersion> getVersions(Long materialId, User loggedUser) {
        Material material = findMaterial(materialId);
        return materialVersionRepository.findByMaterialOrderByVersionNumberDesc(material);
    }

    @Override
    public MaterialVersion getLatestVersion(Long materialId, User loggedUser) {
        Material material = findMaterial(materialId);

        MaterialVersion latestVersion =
                materialVersionRepository.findTopByMaterialOrderByVersionNumberDesc(material);

        if (latestVersion == null) {
            throw new RuntimeException("No versions found");
        }

        return latestVersion;
    }
}