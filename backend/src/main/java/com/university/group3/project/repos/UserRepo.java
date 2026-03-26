package com.university.group3.project.repos;

import com.university.group3.project.dtos.UserDto;
import com.university.group3.project.entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Long> {


    Optional<User> findByEmail(String email);

    Optional<User> findByRefreshToken(String refreshToken);

    Optional<User> findByPhoneNumber(String phoneNumber);





    @Transactional
    @Modifying
    @Query("update User u set u.password= ?2 where u.email = ?1")
    void updatePassword(String email, String password);
}

