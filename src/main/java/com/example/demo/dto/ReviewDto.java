package com.example.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ReviewDto {
    private Long id;

    @NotNull(message = "Đánh giá sao không được null")
    @Min(value = 1, message = "Đánh giá sao phải ít nhất là 1")
    @Max(value = 5, message = "Đánh giá sao không được quá 5")
    private int rating;

    @NotBlank(message = "Bình luận không được để trống")
    private String comment;

    private String userName;
    private LocalDateTime createdAt;
    private String imageUrl;
    private String adminReply;
    private LocalDateTime repliedAt;
    private String adminReplyImageUrl;

    // --- Getters & Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAdminReply() {
        return adminReply;
    }

    public void setAdminReply(String adminReply) {
        this.adminReply = adminReply;
    }

    public LocalDateTime getRepliedAt() {
        return repliedAt;
    }

    public void setRepliedAt(LocalDateTime repliedAt) {
        this.repliedAt = repliedAt;
    }

    public String getAdminReplyImageUrl() {
        return adminReplyImageUrl;
    }

    public void setAdminReplyImageUrl(String adminReplyImageUrl) {
        this.adminReplyImageUrl = adminReplyImageUrl;
    }
}
