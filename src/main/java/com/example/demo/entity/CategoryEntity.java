package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
public class CategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // ✅ thêm mô tả (tuỳ chọn)
    private String description;

    // ✅ thêm đường dẫn ảnh
    @Column(name = "image_url")
    private String imageUrl;

    // Quan hệ 1 - nhiều với Product
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductEntity> products;
}
