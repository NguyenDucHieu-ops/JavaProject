package com.example.demo.service.impl;

import com.example.demo.dto.CategoryDto;
import com.example.demo.entity.CategoryEntity;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CategoryMapper;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.service.CategoryService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return CategoryMapper.toDto(category);
    }

    @Override
    public CategoryDto createCategory(CategoryDto dto, MultipartFile file) {
        CategoryEntity category = CategoryMapper.toEntity(dto);

        if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            dest.getParentFile().mkdirs();

            try {
                file.transferTo(dest);
                category.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save category image", e);
            }
        }

        CategoryEntity saved = categoryRepository.save(category);
        return CategoryMapper.toDto(saved);
    }

    @Override
    public CategoryDto updateCategory(Long id, CategoryDto dto, MultipartFile file) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File dest = new File(uploadDir + fileName);
            dest.getParentFile().mkdirs();

            try {
                file.transferTo(dest);
                category.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to update category image", e);
            }
        }

        CategoryEntity updated = categoryRepository.save(category);
        return CategoryMapper.toDto(updated);
    }

    @Override
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id: " + id);
        }
        categoryRepository.deleteById(id);
    }
}
