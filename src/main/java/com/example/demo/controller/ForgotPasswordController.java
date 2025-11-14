package com.example.demo.controller;

import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/user")
@RequiredArgsConstructor
public class ForgotPasswordController {
    private final UserService userService;

    // Gửi OTP (body: { "usernameOrEmail": "..." })
    @PostMapping("/forgot-password")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String usernameOrEmail = body.get("usernameOrEmail");
        boolean sent = userService.sendOtpForForgotPassword(usernameOrEmail);
        if (sent)
            return ResponseEntity.ok(Map.of("message", "OTP đã được gửi (nếu email tồn tại)."));
        return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy user."));
    }

    // Reset mật khẩu (body: { "usernameOrEmail": "...", "otp":"...",
    // "newPassword":"..." })
    @PostMapping("/reset-password")
    public ResponseEntity<?> reset(@RequestBody Map<String, String> body) {
        String usernameOrEmail = body.get("usernameOrEmail");
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");
        boolean ok = userService.resetPasswordWithOtp(usernameOrEmail, otp, newPassword);
        if (ok)
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công."));
        return ResponseEntity.badRequest()
                .body(Map.of("message", "OTP không hợp lệ / đã hết hạn hoặc user không tồn tại."));
    }
}
