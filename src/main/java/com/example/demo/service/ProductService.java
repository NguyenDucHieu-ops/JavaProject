package com.example.demo.service;

import com.example.demo.dto.ProductDto;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ProductService {

    ProductDto addProduct(ProductDto productDto);

    ProductDto updateProduct(Long id, ProductDto productDto);

    List<ProductDto> getAllProducts();

    ProductDto getProductById(Long id);

    void deleteProduct(Long id);

    List<ProductDto> searchByName(String keyword);

    List<ProductDto> getProductsByCategory(Long categoryId);

    List<ProductDto> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    Map<String, Object> getProductStats();

    // --- HÀM MỚI CHO DASHBOARD ---
    List<ProductDto> getLatestProducts(int limit);
}
