package com.university.group3.project.repos;

import com.university.group3.project.entities.ForgotPassword;
import com.university.group3.project.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPassword, Integer> {


    Optional<ForgotPassword> findByOtpAndUser(Integer otp, User user);


    Optional<ForgotPassword> findByUser(User user);
}
