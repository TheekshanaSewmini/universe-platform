package com.university.group3.project.service;

import com.university.group3.project.dtos.AuthResponse;
import com.university.group3.project.dtos.LoginRequest;
import com.university.group3.project.dtos.UserDto;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {



    AuthResponse signUp(UserDto.RegisterRequest  registerRequest);

    AuthResponse SignIn(LoginRequest loginRequest, HttpServletResponse response);

    AuthResponse verifyCode(String email, String verifyCode);


    AuthResponse resendOtp(String email);


}