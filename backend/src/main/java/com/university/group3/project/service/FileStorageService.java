package com.university.group3.project.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Set<String> MATERIAL_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "mp4", "mov", "avi", "jpg", "jpeg", "png", "webp"
    );
    private static final Set<String> IMAGE_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final Set<String> MATERIAL_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain",
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public StoredFile storeImage(MultipartFile file) {
        return store(file, "", IMAGE_EXTENSIONS, IMAGE_CONTENT_TYPES);
    }

    public StoredFile storeMaterial(MultipartFile file) {
        return store(file, "materials", MATERIAL_EXTENSIONS, MATERIAL_CONTENT_TYPES);
    }

    private StoredFile store(
            MultipartFile file,
            String subDirectory,
            Set<String> allowedExtensions,
            Set<String> allowedContentTypes
    ) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        if (originalName.contains("..")) {
            throw new RuntimeException("Invalid file name");
        }

        String extension = getExtension(originalName);
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!allowedExtensions.contains(extension) || !allowedContentTypes.contains(contentType)) {
            throw new RuntimeException("Unsupported file type");
        }

        String storedName = UUID.randomUUID() + "." + extension;
        Path directory = subDirectory.isBlank() ? uploadRoot : uploadRoot.resolve(subDirectory).normalize();
        Path destination = directory.resolve(storedName).normalize();
        if (!destination.startsWith(uploadRoot)) {
            throw new RuntimeException("Invalid upload path");
        }

        try {
            Files.createDirectories(directory);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destination, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new RuntimeException("File upload failed");
        }

        String url = "/uploads/" + (subDirectory.isBlank() ? "" : subDirectory + "/") + storedName;
        return new StoredFile(url, originalName, contentType, file.getSize());
    }

    private String getExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == filename.length() - 1) {
            throw new RuntimeException("File extension is required");
        }
        return filename.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }

    public record StoredFile(String url, String originalFilename, String contentType, long size) {
    }
}
