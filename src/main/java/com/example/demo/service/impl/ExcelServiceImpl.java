package com.example.demo.service.impl;

import com.example.demo.entity.CategoryEntity;
import com.example.demo.entity.ProductEntity;
import com.example.demo.helper.ExcelHelper;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExcelServiceImpl implements ExcelService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void save(MultipartFile file) {
        try {
            if (!ExcelHelper.hasExcelFormat(file)) {
                throw new RuntimeException("File is not an Excel format!");
            }
            List<ProductEntity> products = ExcelHelper.excelToProducts(file.getInputStream(), categoryRepository);
            productRepository.saveAll(products);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store excel data: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream load() {
        // 🌟 SỬA LỖI 500: Gọi hàm mới "findAllForExport()" thay vì "findAll()"
        List<ProductEntity> products = productRepository.findAllForExport();
        List<CategoryEntity> categories = categoryRepository.findAll();

        // 🗑️ Bỏ vòng lặp for (nếu có), vì JOIN FETCH đã xử lý

        return ExcelHelper.dataToExcel(products, categories);
    }
}
