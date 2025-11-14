package com.example.demo.controller;

import com.example.demo.dto.UserProfileDto; // ✅ MỚI
import com.example.demo.entity.UserEntity;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // ✅ MỚI
import org.springframework.security.core.Authentication; // ✅ MỚI
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // ✅ MỚI

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // ✅ Thêm CrossOrigin
public class UserController {

    private final UserService userService;

    // ✅ Lấy toàn bộ user (Code cũ của bạn)
    @GetMapping
    public List<UserEntity> all() {
        return userService.getAllUsers();
    }

    // ✅ Lấy 1 user theo ID (Code cũ của bạn)
    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUser(@PathVariable Long id) {
        UserEntity user = userService.getUserById(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    // ✅ Thêm user mới (Code cũ của bạn)
    @PostMapping
    public ResponseEntity<UserEntity> create(@RequestBody UserEntity user) {
        UserEntity saved = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ✅ Cập nhật user (Code cũ của bạn)
    @PutMapping("/{id}")
    public ResponseEntity<UserEntity> update(@PathVariable Long id, @RequestBody UserEntity updatedUser) {
        UserEntity user = userService.updateUser(id, updatedUser);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    // ✅ Xóa user (Code cũ của bạn)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        return deleted
                ? ResponseEntity.ok("User deleted successfully")
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    // Nâng cao: Quên mật khẩu (Code cũ của bạn)
    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> req) {
        String usernameOrEmail = req.get("usernameOrEmail");
        boolean ok = userService.sendOtpForForgotPassword(usernameOrEmail);
        return ok ? ResponseEntity.ok("OTP sent") : ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    // Nâng cao: Quên mật khẩu (Code cũ của bạn)
    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        String usernameOrEmail = req.get("usernameOrEmail");
        String otp = req.get("otp");
        String newPassword = req.get("newPassword");
        boolean ok = userService.resetPasswordWithOtp(usernameOrEmail, otp, newPassword);
        return ok ? ResponseEntity.ok("Password reset successful")
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP invalid or user not found");
    }

    // --- ✅ CÁC ENDPOINT MỚI CHO PROFILE ---

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()") // Yêu cầu đã đăng nhập
    public ResponseEntity<UserProfileDto> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.getProfileByUsername(username));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDto> updateMyProfile(Authentication authentication,
            @RequestBody UserProfileDto profileDto) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.updateProfile(username, profileDto));
    }

    @PostMapping("/profile/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileDto> updateMyAvatar(Authentication authentication,
            @RequestParam("file") MultipartFile file) {
        String username = authentication.getName();
        return ResponseEntity.ok(userService.updateAvatar(username, file));
    }
}