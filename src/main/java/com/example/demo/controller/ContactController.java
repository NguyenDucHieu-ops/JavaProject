package com.example.demo.controller;

import com.example.demo.dto.ContactDto;
import com.example.demo.dto.ReplyDto;
import com.example.demo.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // ✅ MỚI
import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired
    private ContactService contactService;

    /**
     * Sửa lại hàm này: Dùng @RequestPart
     */
    @PostMapping
    public ResponseEntity<?> createContact(
            @RequestPart("contactDto") ContactDto contactDto, // ✅ SỬA
            @RequestPart(value = "file", required = false) MultipartFile file, // ✅ MỚI
            Authentication authentication) {

        String username = null;
        if (authentication != null && authentication.isAuthenticated()) {
            username = authentication.getName();
        }

        try {
            contactService.saveContact(contactDto, username, file); // ✅ CẬP NHẬT
            return ResponseEntity.ok("Gửi liên hệ thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi liên hệ: " + e.getMessage());
        }
    }

    // --- CÁC ENDPOINT CHO ADMIN (Không đổi) ---
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContactDto>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContactDto> getContactById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getContactById(id));
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> replyToContact(@PathVariable Long id, @RequestBody ReplyDto replyDto) {
        try {
            contactService.replyToContact(id, replyDto.getReplyMessage());
            return ResponseEntity.ok("Đã trả lời thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // --- Endpoint cho user (Không đổi) ---
    @GetMapping("/my-tickets")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ContactDto>> getMyContacts(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        return ResponseEntity.ok(contactService.findMyContacts(username));
    }
}