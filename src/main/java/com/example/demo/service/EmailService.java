package com.example.demo.service;

import jakarta.mail.MessagingException; // 👈 MỚI
import jakarta.mail.internet.MimeMessage; // 👈 MỚI
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // 👈 MỚI
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper; // 👈 MỚI
import org.springframework.stereotype.Service;

// 🗑️ Bỏ: import org.springframework.mail.SimpleMailMessage;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    // 👈 MỚI: Lấy email gửi (từ application.properties)
    @Value("${spring.mail.username}")
    private String fromEmail;

    // 🌟 SỬA: Dùng MimeMessage thay vì SimpleMailMessage để hỗ trợ UTF-8 (Tiếng
    // Việt)
    public void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            // true = bật chế độ multipart (nếu cần đính kèm file)
            // "UTF-8" = encoding cho Tiếng Việt
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false); // false = email này là text thuần, không phải HTML

            mailSender.send(message);

        } catch (MessagingException e) {
            // Ném lỗi runtime để UserServiceImpl có thể bắt (và in ra log)
            throw new RuntimeException("Gửi email thất bại (MimeMessage): " + e.getMessage(), e);
        }
    }
}