package com.university.group3.project.controller;

import com.university.group3.project.dtos.UserDto;
import com.university.group3.project.service.ForgotPasswordService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/forgotpass")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService service;

    // ================= OTP =================

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(
            @RequestBody Map<String, String> body,
            HttpServletResponse response
    ) {
        return service.sendOtp(body, response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return service.resendOtp(request, response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestBody Map<String, String> body,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        return service.verifyOtp(body, request, response);
    }

    // ================= PASSWORD =================

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody UserDto.ChangePassword dto
    ) {
        return service.changePassword(request, response, dto);
    }
}