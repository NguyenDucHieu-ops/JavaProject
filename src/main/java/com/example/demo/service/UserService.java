package com.example.demo.service;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserProfileDto; // ✅ MỚI
import com.example.demo.entity.UserEntity;
import org.springframework.web.multipart.MultipartFile; // ✅ MỚI

import java.util.List;
import java.util.Map;

public interface UserService {
    Map<String, Object> register(RegisterRequest request);

    Map<String, Object> login(LoginRequest request);

    List<UserEntity> getAllUsers();

    UserEntity getUserById(Long id);

    UserEntity createUser(UserEntity user);

    UserEntity updateUser(Long id, UserEntity updatedUser);

    boolean deleteUser(Long id);

    boolean sendOtpForForgotPassword(String usernameOrEmail);

    boolean resetPasswordWithOtp(String usernameOrEmail, String otp, String newPassword);

    // ✅ MỚI: Thêm 3 hàm profile
    UserProfileDto getProfileByUsername(String username);

    UserProfileDto updateProfile(String username, UserProfileDto profileDto);

    UserProfileDto updateAvatar(String username, MultipartFile file);
}