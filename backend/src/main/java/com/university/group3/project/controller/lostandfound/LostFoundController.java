package com.university.group3.project.controller.lostandfound;

import com.university.group3.project.dtos.lostandfound.FoundItemDTO;
import com.university.group3.project.dtos.lostandfound.LostItemDTO;
import com.university.group3.project.entities.User;
import com.university.group3.project.service.lostandfound.LostFoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/lostfound")
@RequiredArgsConstructor
public class LostFoundController {

    private final LostFoundService service;

    //FOUND

    @PostMapping("/found")
    public ResponseEntity<?> createFound(
            @ModelAttribute FoundItemDTO dto,
            @RequestParam MultipartFile image,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.createFound(dto, image, user));
    }

    @PutMapping("/found/{id}")
    public ResponseEntity<?> updateFound(
            @PathVariable Long id,
            @ModelAttribute FoundItemDTO dto,
            @RequestParam(required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.updateFound(id, dto, image, user));
    }

    @DeleteMapping("/found/{id}")
    public ResponseEntity<?> deleteFound(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        service.deleteFound(id, user);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/found")
    public ResponseEntity<?> getAllFound() {
        return ResponseEntity.ok(service.getAllFound());
    }

    @GetMapping("/found/me")
    public ResponseEntity<?> myFound(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getMyFound(user));
    }

    // LOST

    @PostMapping("/lost")
    public ResponseEntity<?> createLost(
            @ModelAttribute LostItemDTO dto,
            @RequestParam MultipartFile image,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.createLost(dto, image, user));
    }

    @PutMapping("/lost/{id}")
    public ResponseEntity<?> updateLost(
            @PathVariable Long id,
            @ModelAttribute LostItemDTO dto,
            @RequestParam(required = false) MultipartFile image,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.updateLost(id, dto, image, user));
    }

    @DeleteMapping("/lost/{id}")
    public ResponseEntity<?> deleteLost(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        service.deleteLost(id, user);
        return ResponseEntity.ok("Deleted");
    }

    @GetMapping("/lost")
    public ResponseEntity<?> getAllLost() {
        return ResponseEntity.ok(service.getAllLost());
    }

    @GetMapping("/lost/me")
    public ResponseEntity<?> myLost(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getMyLost(user));
    }

    @GetMapping("/lost/{id}")
    public ResponseEntity<?> getLostById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getLostById(id));
    }

    //SUGGEST

    @GetMapping("/suggest")
    public ResponseEntity<?> suggest(@RequestParam String itemName) {
        return ResponseEntity.ok(service.suggest(itemName));
    }


    @GetMapping("/found/{id}")
    public ResponseEntity<?> getFoundById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getFoundById(id));
    }
}