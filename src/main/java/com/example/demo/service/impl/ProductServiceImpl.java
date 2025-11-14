package com.example.demo.service.impl;

import com.example.demo.dto.ProductDto;
import com.example.demo.entity.CategoryEntity;
import com.example.demo.entity.ProductEntity;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.ProductService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public ProductDto addProduct(ProductDto productDto) {
        CategoryEntity category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + productDto.getCategoryId()));

        ProductEntity product = ProductMapper.toEntity(productDto, category);
        ProductEntity saved = productRepository.save(product);
        return ProductMapper.toDto(saved);
    }

    @Override
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        ProductEntity existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        CategoryEntity category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + productDto.getCategoryId()));

        existing.setName(productDto.getName());
        existing.setDescription(productDto.getDescription());
        existing.setPrice(productDto.getPrice());
        existing.setQuantity(productDto.getQuantity());
        existing.setCategory(category);

        if (productDto.getImageUrl() != null) {
            existing.setImageUrl(productDto.getImageUrl());
        }

        ProductEntity updated = productRepository.save(existing);
        return ProductMapper.toDto(updated);
    }

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepository.findAllForExport()
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto getProductById(Long id) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ProductMapper.toDto(product);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id))
            throw new ResourceNotFoundException("Product not found with id: " + id);
        productRepository.deleteById(id);
    }

    @Override
    public List<ProductDto> searchByName(String keyword) {
        return productRepository.findByNameContainingIgnoreCaseWithCategory(keyword)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId))
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);

        return productRepository.findByCategoryIdWithCategory(categoryId)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetweenWithCategory(minPrice, maxPrice)
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getProductStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", productRepository.count());

        List<Object[]> categoryCounts = productRepository.countProductsByCategory();
        stats.put("countByCategory", categoryCounts.stream()
                .collect(Collectors.toMap(o -> (String) o[0], o -> (Long) o[1])));

        return stats;
    }

    // --- HÀM MỚI CHO DASHBOARD ---
    @Override
    public List<ProductDto> getLatestProducts(int limit) {
        // Repo chỉ trả 5 sản phẩm mới nhất, limit tạm bỏ qua
        return productRepository.findFirst5ByOrderByIdDesc()
                .stream()
                .map(ProductMapper::toDto)
                .collect(Collectors.toList());
    }
}
