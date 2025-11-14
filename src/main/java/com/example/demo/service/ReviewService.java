package com.example.demo.service;

import com.example.demo.dto.ReviewDto;
import com.example.demo.entity.ReviewEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReviewService {

    ReviewEntity saveSiteReview(ReviewDto reviewDto, String username, MultipartFile file);

    List<ReviewDto> getAllSiteReviews();

    ReviewEntity replyToReview(Long id, String replyMessage, MultipartFile file, String username);

    void deleteReview(Long id);
}
