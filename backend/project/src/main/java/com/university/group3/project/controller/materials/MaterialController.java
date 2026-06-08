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



    // COURSES

    // Create a course owned by the authenticated user.
    @PostMapping("/courses/create")
    public ResponseEntity<?> createCourse(
            @RequestBody CourseDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.createCourse(dto, user));
    }

    // Update a course; only the owner can update.
    @PutMapping("/courses/update/{id}")
    public ResponseEntity<?> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.updateCourse(id, dto, user));
    }

    // Delete a course; only the owner can delete.
    @DeleteMapping("/courses/delete/{id}")
    public ResponseEntity<?> deleteCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        materialService.deleteCourse(id, user);
        return ResponseEntity.ok("Deleted");
    }

    // List all courses.
    @GetMapping("/courses/list")
    public ResponseEntity<?> getCourses() {
        return ResponseEntity.ok(materialService.getCourses());
    }

    // List courses owned by the authenticated user.
    @GetMapping("/courses/my")
    public ResponseEntity<?> getMyCourses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.getMyCourses(user));
    }

    // Get a single course by id.
    @GetMapping("/courses/get/{id}")
    public ResponseEntity<?> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getCourse(id));
    }

    // ---------- SUBJECTS ----------

    // Create a subject under a course; owned by the authenticated user.
    @PostMapping("/subjects/create")
    public ResponseEntity<?> createSubject(
            @RequestBody SubjectDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.createSubject(dto, user));
    }

    // Update a subject; only the owner can update.
    @PutMapping("/subjects/update/{id}")
    public ResponseEntity<?> updateSubject(
            @PathVariable Long id,
            @RequestBody SubjectDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.updateSubject(id, dto, user));
    }

    // Delete a subject; only the owner can delete.
    @DeleteMapping("/subjects/delete/{id}")
    public ResponseEntity<?> deleteSubject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        materialService.deleteSubject(id, user);
        return ResponseEntity.ok("Deleted");
    }

    // List subjects; optionally filter by courseId.
    @GetMapping("/subjects/list")
    public ResponseEntity<?> getSubjects(
            @RequestParam(required = false) Long courseId) {
        return ResponseEntity.ok(materialService.getSubjects(courseId));
    }

    // List subjects owned by the authenticated user; optionally filter by courseId.
    @GetMapping("/subjects/my")
    public ResponseEntity<?> getMySubjects(
            @RequestParam(required = false) Long courseId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.getMySubjects(courseId, user));
    }

    // Get a single subject by id.
    @GetMapping("/subjects/get/{id}")
    public ResponseEntity<?> getSubject(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getSubject(id));
    }

    // ---------- MATERIALS ----------

    // Multipart: file + MaterialDTO fields.
    // Create a material (file upload required); owned by the authenticated user.
    @PostMapping("/mcreate")
    public ResponseEntity<?> createMaterial(
            @ModelAttribute MaterialDTO dto,
            @RequestParam MultipartFile file,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.createMaterial(dto, file, user));
    }

    // Update a material; only the owner can update.
    @PutMapping("/mupdate/{id}")
    public ResponseEntity<?> updateMaterial(
            @PathVariable Long id,
            @RequestBody MaterialDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.updateMaterial(id, dto, user));
    }

    // Delete a material; only the owner can delete.
    @DeleteMapping("/mdelete/{id}")
    public ResponseEntity<?> deleteMaterial(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        materialService.deleteMaterial(id, user);
        return ResponseEntity.ok("Deleted");
    }

    // List materials; optionally filter by subjectId or courseId.
    @GetMapping("/mlist")
    public ResponseEntity<?> getMaterials(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long courseId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.getMaterials(subjectId, courseId, user));
    }

    // List materials owned by the authenticated user; optionally filter by subjectId or courseId.
    @GetMapping("/mmy")
    public ResponseEntity<?> getMyMaterials(
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long courseId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.getMyMaterials(subjectId, courseId, user));
    }

    // Get a single material by id.
    @GetMapping("/mget/{id}")
    public ResponseEntity<?> getMaterial(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.getMaterial(id, user));
    }

    // Multipart: upload a new file version for this material.
    @PostMapping("/mversions/add/{id}")
    public ResponseEntity<?> addVersion(
            @PathVariable Long id,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.addVersion(id, notes, file, user));
    }

    // List all versions for a material.
    @GetMapping("/mversions/list/{id}")
    public ResponseEntity<?> getVersions(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.getVersions(id, user));
    }

    // Get the latest version for a material.
    @GetMapping("/mversions/latest/{id}")
    public ResponseEntity<?> getLatestVersion(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(materialService.getLatestVersion(id, user));
    }
}
