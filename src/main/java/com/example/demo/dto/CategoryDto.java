package com.example.demo.dto;

import lombok.Data;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String description; // ✅ thêm mô tả
    private String imageUrl; // ✅ thêm ảnh
}
