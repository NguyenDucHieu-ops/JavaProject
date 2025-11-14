package com.example.demo.controller;

import com.example.demo.dto.ReviewDto;
import com.example.demo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // ✅ Lấy tất cả đánh giá (public)
    @GetMapping
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        try {
            List<ReviewDto> reviews = reviewService.getAllSiteReviews();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // ✅ Người dùng tạo đánh giá
    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestPart("reviewDto") ReviewDto reviewDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("Yêu cầu đăng nhập để đánh giá.");
        }

        try {
            reviewService.saveSiteReview(reviewDto, auth.getName(), file);
            return ResponseEntity.ok("Gửi đánh giá thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server khi gửi đánh giá: " + e.getMessage());
        }
    }

    // ✅ ADMIN trả lời (có thể kèm ảnh)
    @PostMapping(path = "/{id}/reply", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> replyToReview(
            @PathVariable Long id,
            @RequestPart("replyMessage") String replyMessage,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        try {
            reviewService.replyToReview(id, replyMessage, file, authentication.getName());
            return ResponseEntity.ok("Đã trả lời đánh giá thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server khi trả lời đánh giá: " + e.getMessage());
        }
    }

    // ✅ ADMIN xóa đánh giá
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok("Đã xóa đánh giá thành công!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server khi xóa đánh giá: " + e.getMessage());
        }
    }
}
