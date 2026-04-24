package com.university.group3.project.controller.materials;

import com.university.group3.project.dtos.materials.CourseDTO;
import com.university.group3.project.dtos.materials.MaterialDTO;
import com.university.group3.project.dtos.materials.SubjectDTO;
import com.university.group3.project.entities.User;
import com.university.group3.project.service.materials.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    // ================= COURSES =================

    @PostMapping("/courses/create")
    public ResponseEntity<Object> createCourse(
            @RequestBody CourseDTO courseDTO,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object createdCourse = materialService.createCourse(courseDTO, loggedUser);
        return ResponseEntity.ok(createdCourse);
    }

    @PutMapping("/courses/update/{courseId}")
    public ResponseEntity<Object> updateCourse(
            @PathVariable Long courseId,
            @RequestBody CourseDTO courseDTO,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object updatedCourse = materialService.updateCourse(courseId, courseDTO, loggedUser);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/courses/delete/{courseId}")
    public ResponseEntity<String> deleteCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User loggedUser
    ) {
        materialService.deleteCourse(courseId, loggedUser);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/courses/list")
    public ResponseEntity<Object> getAllCourses() {
        Object courses = materialService.getCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/my")
    public ResponseEntity<Object> getLoggedUserCourses(
            @AuthenticationPrincipal User loggedUser
    ) {
        Object courses = materialService.getMyCourses(loggedUser);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/get/{courseId}")
    public ResponseEntity<Object> getCourseById(
            @PathVariable Long courseId
    ) {
        Object course = materialService.getCourse(courseId);
        return ResponseEntity.ok(course);
    }

    // ================= SUBJECTS =================

    @PostMapping("/subjects/create")
    public ResponseEntity<Object> createSubject(
            @RequestBody SubjectDTO subjectDTO,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object createdSubject = materialService.createSubject(subjectDTO, loggedUser);
        return ResponseEntity.ok(createdSubject);
    }

    @PutMapping("/subjects/update/{subjectId}")
    public ResponseEntity<Object> updateSubject(
            @PathVariable Long subjectId,
            @RequestBody SubjectDTO subjectDTO,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object updatedSubject = materialService.updateSubject(subjectId, subjectDTO, loggedUser);
        return ResponseEntity.ok(updatedSubject);
    }

    @DeleteMapping("/subjects/delete/{subjectId}")
    public ResponseEntity<String> deleteSubject(
            @PathVariable Long subjectId,
            @AuthenticationPrincipal User loggedUser
    ) {
        materialService.deleteSubject(subjectId, loggedUser);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/subjects/list")
    public ResponseEntity<Object> getAllSubjects(
            @RequestParam(required = false) Long courseId
    ) {
        Object subjects = materialService.getSubjects(courseId);
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/subjects/my")
    public ResponseEntity<Object> getLoggedUserSubjects(
            @RequestParam(required = false) Long courseId,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object subjects = materialService.getMySubjects(courseId, loggedUser);
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/subjects/get/{subjectId}")
    public ResponseEntity<Object> getSubjectById(
            @PathVariable Long subjectId
    ) {
        Object subject = materialService.getSubject(subjectId);
        return ResponseEntity.ok(subject);
    }

    // ================= MATERIALS =================

    @PostMapping("/mcreate")
    public ResponseEntity<Object> createMaterial(
            @ModelAttribute MaterialDTO materialDTO,
            @RequestParam MultipartFile file,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object createdMaterial = materialService.createMaterial(materialDTO, file, loggedUser);
        return ResponseEntity.ok(createdMaterial);
    }

    @PutMapping("/mupdate/{materialId}")
    public ResponseEntity<Object> updateMaterial(
            @PathVariable Long materialId,
            @RequestBody MaterialDTO materialDTO,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object updatedMaterial = materialService.updateMaterial(materialId, materialDTO, loggedUser);
        return ResponseEntity.ok(updatedMaterial);
    }

    @DeleteMapping("/mdelete/{materialId}")
    public ResponseEntity<String> deleteMaterial(
            @PathVariable Long materialId,
            @AuthenticationPrincipal User loggedUser
    ) {
        materialService.deleteMaterial(materialId, loggedUser);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/mlist")
    public ResponseEntity<Object> getAllMaterials(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long courseId,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object materials = materialService.getMaterials(subjectId, courseId, loggedUser);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/mmy")
    public ResponseEntity<Object> getLoggedUserMaterials(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long courseId,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object materials = materialService.getMyMaterials(subjectId, courseId, loggedUser);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/mget/{materialId}")
    public ResponseEntity<Object> getMaterialById(
            @PathVariable Long materialId,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object material = materialService.getMaterial(materialId, loggedUser);
        return ResponseEntity.ok(material);
    }

    // ================= MATERIAL VERSIONS =================

    @PostMapping("/mversions/add/{materialId}")
    public ResponseEntity<Object> addMaterialVersion(
            @PathVariable Long materialId,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object version = materialService.addVersion(materialId, notes, file, loggedUser);
        return ResponseEntity.ok(version);
    }

    @GetMapping("/mversions/list/{materialId}")
    public ResponseEntity<Object> getMaterialVersions(
            @PathVariable Long materialId,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object versions = materialService.getVersions(materialId, loggedUser);
        return ResponseEntity.ok(versions);
    }

    @GetMapping("/mversions/latest/{materialId}")
    public ResponseEntity<Object> getLatestMaterialVersion(
            @PathVariable Long materialId,
            @AuthenticationPrincipal User loggedUser
    ) {
        Object latestVersion = materialService.getLatestVersion(materialId, loggedUser);
        return ResponseEntity.ok(latestVersion);
    }
}