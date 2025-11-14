package com.example.demo.repository;

import com.example.demo.entity.ReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewEntity, Long> {

    // Tự động tạo câu query: "SELECT * FROM reviews ORDER BY createdAt DESC"
    List<ReviewEntity> findAllByOrderByCreatedAtDesc();

}