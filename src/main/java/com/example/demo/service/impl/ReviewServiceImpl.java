package com.example.demo.service.impl;

import com.example.demo.dto.ReviewDto;
import com.example.demo.entity.ReviewEntity;
import com.example.demo.entity.UserEntity;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReviewService;
import com.example.demo.service.StorageService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    @Override
    public ReviewEntity saveSiteReview(ReviewDto reviewDto, String username, MultipartFile file) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng: " + username));

        String imageUrl = (file != null && !file.isEmpty()) ? storageService.store(file) : null;

        ReviewEntity review = new ReviewEntity();
        review.setRating(reviewDto.getRating());
        review.setComment(reviewDto.getComment());
        review.setCreatedAt(LocalDateTime.now());
        review.setUser(user);
        review.setImageUrl(imageUrl);

        return reviewRepository.save(review);
    }

    @Override
    public List<ReviewDto> getAllSiteReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewEntity replyToReview(Long id, String replyMessage, MultipartFile file, String username) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đánh giá ID: " + id));

        String replyImageUrl = (file != null && !file.isEmpty()) ? storageService.store(file) : null;

        review.setAdminReply(replyMessage);
        review.setRepliedAt(LocalDateTime.now());
        review.setAdminReplyImageUrl(replyImageUrl);

        return reviewRepository.save(review);
    }

    @Override
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy đánh giá với ID: " + id);
        }
        reviewRepository.deleteById(id);
    }

    private ReviewDto convertToDto(ReviewEntity review) {
        ReviewDto dto = new ReviewDto();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setImageUrl(review.getImageUrl());
        dto.setUserName(review.getUser() != null ? review.getUser().getName() : "Ẩn danh");

        dto.setAdminReply(review.getAdminReply());
        dto.setRepliedAt(review.getRepliedAt());
        dto.setAdminReplyImageUrl(review.getAdminReplyImageUrl());
        return dto;
    }
}
