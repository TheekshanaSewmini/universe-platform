package com.university.group3.project.service.materials;

import com.university.group3.project.dtos.materials.CourseDTO;
import com.university.group3.project.dtos.materials.MaterialDTO;
import com.university.group3.project.dtos.materials.MaterialType;
import com.university.group3.project.dtos.materials.MaterialVisibility;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaterialServiceImpl implements MaterialService {

    private final CourseRepository courseRepo;
    private final SubjectRepository subjectRepo;
    private final MaterialRepository materialRepo;
    private final MaterialVersionRepository versionRepo;

    private static final String MATERIAL_UPLOAD_DIR = "uploads/materials/";

    private void requireAuthenticated(User user) {
        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }
    }

    private void ensureOwner(User owner, User user, Runnable assignOwner) {
        requireAuthenticated(user);
        if (owner == null) {
            assignOwner.run();
            return;
        }
        if (!owner.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Access denied");
        }
    }

    private void ensureOwner(Material material, User user) {
        ensureOwner(material.getOwner(), user, () -> material.setOwner(user));
    }

    private boolean isOwner(Material material, User user) {
        if (user == null || material.getOwner() == null) {
            return false;
        }
        return material.getOwner().getUserId().equals(user.getUserId());
    }

    private boolean isPublic(Material material) {
        return material.getVisibility() == null || material.getVisibility() == MaterialVisibility.PUBLIC;
    }

    private void ensureCanView(Material material, User user) {
        if (!isPublic(material) && !isOwner(material, user)) {
            throw new RuntimeException("This material is private");
        }
    }

    private void ensureCanAddVersion(Material material, User user) {
        requireAuthenticated(user);
        if (!isPublic(material) && !isOwner(material, user)) {
            throw new RuntimeException("This material is private");
        }
    }

    private void ensureUploader(MaterialVersion version, User user) {
        requireAuthenticated(user);
        if (version.getUploadedBy() == null || !version.getUploadedBy().getUserId().equals(user.getUserId())) {
            throw new RuntimeException("Access denied");
        }
    }

    private String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }
        try {
            Files.createDirectories(Paths.get(MATERIAL_UPLOAD_DIR));
            String originalName = file.getOriginalFilename();
            String name = System.currentTimeMillis() + "_" + (originalName == null ? "file" : originalName);
            Path path = Paths.get(MATERIAL_UPLOAD_DIR + name);
            Files.copy(file.getInputStream(), path);
            return "/uploads/materials/" + name;
        } catch (Exception e) {
            throw new RuntimeException("File upload failed");
        }
    }

    private Material getMaterialOrThrow(Long id) {
        return materialRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));
    }

    @Override
    public Course createCourse(CourseDTO dto, User user) {
        requireAuthenticated(user);
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new RuntimeException("Course name is required");
        }
        Course course = Course.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .description(dto.getDescription())
                .owner(user)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();
        return courseRepo.save(course);
    }

    @Override
    public Course updateCourse(Long id, CourseDTO dto, User user) {
        requireAuthenticated(user);
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        ensureOwner(course.getOwner(), user, () -> course.setOwner(user));
        if (dto.getName() != null) {
            course.setName(dto.getName());
        }
        if (dto.getCode() != null) {
            course.setCode(dto.getCode());
        }
        if (dto.getDescription() != null) {
            course.setDescription(dto.getDescription());
        }
        course.setUpdatedAt(new Date());
        return courseRepo.save(course);
    }

    @Override
    public void deleteCourse(Long id, User user) {
        requireAuthenticated(user);
        Course course = courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        ensureOwner(course.getOwner(), user, () -> course.setOwner(user));
        courseRepo.delete(course);
    }

    @Override
    public List<Course> getCourses() {
        return courseRepo.findAll();
    }

    @Override
    public Course getCourse(Long id) {
        return courseRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Override
    public List<Course> getMyCourses(User user) {
        requireAuthenticated(user);
        return courseRepo.findByOwner(user);
    }

    @Override
    public Subject createSubject(SubjectDTO dto, User user) {
        requireAuthenticated(user);
        if (dto.getCourseId() == null) {
            throw new RuntimeException("Course is required");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new RuntimeException("Subject name is required");
        }
        Course course = courseRepo.findById(dto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        Subject subject = Subject.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .description(dto.getDescription())
                .course(course)
                .owner(user)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();
        return subjectRepo.save(subject);
    }

    @Override
    public Subject updateSubject(Long id, SubjectDTO dto, User user) {
        requireAuthenticated(user);
        Subject subject = subjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        ensureOwner(subject.getOwner(), user, () -> subject.setOwner(user));
        if (dto.getName() != null) {
            subject.setName(dto.getName());
        }
        if (dto.getCode() != null) {
            subject.setCode(dto.getCode());
        }
        if (dto.getDescription() != null) {
            subject.setDescription(dto.getDescription());
        }
        if (dto.getCourseId() != null) {
            Course course = courseRepo.findById(dto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            subject.setCourse(course);
        }
        subject.setUpdatedAt(new Date());
        return subjectRepo.save(subject);
    }

    @Override
    public void deleteSubject(Long id, User user) {
        requireAuthenticated(user);
        Subject subject = subjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        ensureOwner(subject.getOwner(), user, () -> subject.setOwner(user));
        subjectRepo.delete(subject);
    }

    @Override
    public List<Subject> getSubjects(Long courseId) {
        if (courseId == null) {
            return subjectRepo.findAll();
        }
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return subjectRepo.findByCourse(course);
    }

    @Override
    public Subject getSubject(Long id) {
        return subjectRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    @Override
    public List<Subject> getMySubjects(Long courseId, User user) {
        requireAuthenticated(user);
        if (courseId == null) {
            return subjectRepo.findByOwner(user);
        }
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return subjectRepo.findByOwnerAndCourse(user, course);
    }

    @Override
    public Material createMaterial(MaterialDTO dto, MultipartFile file, User user) {
        requireAuthenticated(user);
        if (dto.getSubjectId() == null) {
            throw new RuntimeException("Subject is required");
        }
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }
        Subject subject = subjectRepo.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        MaterialType type = dto.getType() == null ? MaterialType.OTHER : dto.getType();
        MaterialVisibility visibility = dto.getVisibility() == null ? MaterialVisibility.PUBLIC : dto.getVisibility();
        Material material = Material.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .type(type)
                .visibility(visibility)
                .subject(subject)
                .owner(user)
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();
        Material saved = materialRepo.save(material);
        MaterialVersion version = MaterialVersion.builder()
                .material(saved)
                .versionNumber(1)
                .fileUrl(saveFile(file))
                .originalFilename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(user)
                .uploadedAt(new Date())
                .build();
        versionRepo.save(version);
        return saved;
    }

    @Override
    public Material updateMaterial(Long id, MaterialDTO dto, User user) {
        Material material = getMaterialOrThrow(id);
        ensureOwner(material, user);
        if (dto.getTitle() != null) {
            material.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            material.setDescription(dto.getDescription());
        }
        if (dto.getType() != null) {
            material.setType(dto.getType());
        }
        if (dto.getVisibility() != null) {
            material.setVisibility(dto.getVisibility());
        }
        if (dto.getSubjectId() != null) {
            Subject subject = subjectRepo.findById(dto.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            material.setSubject(subject);
        }
        material.setUpdatedAt(new Date());
        return materialRepo.save(material);
    }

    @Override
    public void deleteMaterial(Long id, User user) {
        Material material = getMaterialOrThrow(id);
        ensureOwner(material, user);
        versionRepo.deleteByMaterial(material);
        materialRepo.delete(material);
    }

    @Override
    public Material getMaterial(Long id, User user) {
        Material material = getMaterialOrThrow(id);
        ensureCanView(material, user);
        return material;
    }

    @Override
    public List<Material> getMaterials(Long subjectId, Long courseId, User user) {
        List<Material> materials;
        if (subjectId != null) {
            Subject subject = subjectRepo.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            materials = materialRepo.findBySubject(subject);
        } else if (courseId != null) {
            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            materials = materialRepo.findBySubjectCourse(course);
        } else {
            materials = materialRepo.findAll();
        }
        return materials.stream()
                .filter(material -> isPublic(material) || isOwner(material, user))
                .collect(Collectors.toList());
    }

    @Override
    public List<Material> getMyMaterials(Long subjectId, Long courseId, User user) {
        requireAuthenticated(user);
        if (subjectId != null) {
            Subject subject = subjectRepo.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            return materialRepo.findByOwnerAndSubject(user, subject);
        }
        if (courseId != null) {
            Course course = courseRepo.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            return materialRepo.findByOwnerAndSubjectCourse(user, course);
        }
        return materialRepo.findByOwner(user);
    }

    @Override
    public MaterialVersion addVersion(Long materialId, String notes, MultipartFile file, User user) {
        Material material = getMaterialOrThrow(materialId);
        ensureCanAddVersion(material, user);
        MaterialVersion latest = versionRepo.findTopByMaterialOrderByVersionNumberDesc(material);
        int nextVersion = latest == null ? 1 : latest.getVersionNumber() + 1;
        MaterialVersion version = MaterialVersion.builder()
                .material(material)
                .versionNumber(nextVersion)
                .fileUrl(saveFile(file))
                .originalFilename(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .notes(notes)
                .uploadedBy(user)
                .uploadedAt(new Date())
                .build();
        material.setUpdatedAt(new Date());
        materialRepo.save(material);
        return versionRepo.save(version);
    }

    @Override
    public void deleteVersion(Long versionId, User user) {
        MaterialVersion version = versionRepo.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found"));
        ensureUploader(version, user);
        versionRepo.delete(version);
    }

    @Override
    public List<MaterialVersion> getVersions(Long materialId, User user) {
        Material material = getMaterialOrThrow(materialId);
        ensureCanView(material, user);
        return versionRepo.findByMaterialOrderByVersionNumberDesc(material);
    }

    @Override
    public MaterialVersion getLatestVersion(Long materialId, User user) {
        Material material = getMaterialOrThrow(materialId);
        ensureCanView(material, user);
        MaterialVersion version = versionRepo.findTopByMaterialOrderByVersionNumberDesc(material);
        if (version == null) {
            throw new RuntimeException("No versions found");
        }
        return version;
    }
}
