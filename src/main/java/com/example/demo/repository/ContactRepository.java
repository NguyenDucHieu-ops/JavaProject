package com.example.demo.repository;

import com.example.demo.entity.ContactEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; // ✅ Import

@Repository
public interface ContactRepository extends JpaRepository<ContactEntity, Long> {

    // ✅ MỚI: Lấy tất cả, sắp xếp theo ngày tạo mới nhất (cho Admin)
    List<ContactEntity> findAllByOrderByCreatedAtDesc();

    // ✅ MỚI: Lấy tất cả liên hệ CỦA MỘT USER
    List<ContactEntity> findByUser_UsernameOrderByCreatedAtDesc(String username);
}