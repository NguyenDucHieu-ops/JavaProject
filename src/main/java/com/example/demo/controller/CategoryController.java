package com.example.demo.controller;

import com.example.demo.dto.CategoryDto;
import com.example.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // ✅ Thêm mới category có ảnh
    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(
            @RequestPart("category") CategoryDto categoryDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(categoryService.createCategory(categoryDto, file));
    }

    // ✅ Cập nhật category + ảnh
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Long id,
            @RequestPart("category") CategoryDto categoryDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.ok(categoryService.updateCategory(id, categoryDto, file));
    }

    // ✅ Xóa category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
