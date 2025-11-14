package com.example.demo.service;

import com.example.demo.dto.CategoryDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface CategoryService {
    List<CategoryDto> getAllCategories();

    CategoryDto getCategoryById(Long id);

    CategoryDto createCategory(CategoryDto categoryDto, MultipartFile file);

    CategoryDto updateCategory(Long id, CategoryDto categoryDto, MultipartFile file);

    void deleteCategory(Long id);
}
