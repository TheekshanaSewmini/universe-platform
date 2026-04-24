package com.university.group3.project.controller;

import com.university.group3.project.dtos.UserDto;
import com.university.group3.project.entities.User;
import com.university.group3.project.repos.UserRepo;
import com.university.group3.project.service.AuthService;
import com.university.group3.project.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;
    private final UserProfileService profileService;
    private final UserRepo userRepository;

    private String saveFile(MultipartFile file, String prefix, Long userId) throws IOException {
        String fileName = prefix + "_" + userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Path path = Paths.get("uploads/" + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());

        return "/uploads/" + fileName;
    }

    // ================= PROFILE =================

    @PutMapping("/update-name")
    public ResponseEntity<String> updateName(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDto.UpdateNameDto dto
    ) {
        profileService.updateName(user, dto);
        return ResponseEntity.ok("Name updated successfully");
    }

    @PutMapping("/update-email")
    public ResponseEntity<String> updateEmail(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDto.UpdateEmailDto dto
    ) {
        profileService.updateEmail(user, dto);
        return ResponseEntity.ok("OTP sent to new email for verification");
    }

    @PostMapping("/verify-new-email")
    public ResponseEntity<String> verifyEmail(
            @AuthenticationPrincipal User user,
            @RequestParam String otp
    ) {
        profileService.verifyNewEmail(user, otp);
        return ResponseEntity.ok("Email updated successfully");
    }

    @PutMapping("/update-password")
    public ResponseEntity<String> updatePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDto.UpdatePasswordDto dto
    ) {
        profileService.updatePassword(user, dto);
        return ResponseEntity.ok("Password updated successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto.UserProfileDto> getProfile(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(profileService.getProfile(user.getUserId()));
    }

    // ================= HOME =================

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/home")
    public ResponseEntity<UserDto.UserHomeDto> getHome(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(profileService.getUserHome(user.getUserId()));
    }

    // ================= ACCOUNT =================

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteAccount(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDto.DeleteAccountDto dto
    ) {
        profileService.deleteAccount(user, dto);
        return ResponseEntity.ok("Account deleted successfully");
    }

    @PostMapping("/delete-forgot-request")
    public ResponseEntity<String> requestDelete(
            @AuthenticationPrincipal User user
    ) {
        profileService.requestDeletion(user);
        return ResponseEntity.ok("OTP sent to your registered email. Verify to delete your account.");
    }

    @PostMapping("/delete-forgot-verify")
    public ResponseEntity<String> verifyDelete(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserDto.DeleteAccountForgotVerifyDto dto
    ) {
        profileService.verifyAndDelete(user, dto);
        return ResponseEntity.ok("Account deleted successfully.");
    }

    // ================= FILE UPLOAD =================

    @PostMapping("/upload-profile-image")
    public ResponseEntity<String> uploadProfileImage(
            @AuthenticationPrincipal User user,
            @RequestParam MultipartFile file
    ) throws IOException {

        String url = saveFile(file, "profile", user.getUserId());
        user.setImageUrl(url);
        userRepository.save(user);

        return ResponseEntity.ok(url);
    }

    @PostMapping("/upload-cover-image")
    public ResponseEntity<String> uploadCoverImage(
            @AuthenticationPrincipal User user,
            @RequestParam MultipartFile file
    ) throws IOException {

        String url = saveFile(file, "cover", user.getUserId());
        user.setCoverImageUrl(url);
        userRepository.save(user);

        return ResponseEntity.ok(url);
    }
}