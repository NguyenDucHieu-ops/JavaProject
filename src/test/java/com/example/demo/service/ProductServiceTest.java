package com.example.demo.service;

import com.example.demo.dto.ProductDto;
import com.example.demo.entity.CategoryEntity;
import com.example.demo.entity.ProductEntity;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private ProductServiceImpl productService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        productService = new ProductServiceImpl(productRepository, categoryRepository);
    }

    @Test
    void addProduct_success() {
        // chuẩn bị
        ProductDto dto = new ProductDto();
        dto.setName("Test");
        dto.setDescription("Desc");
        dto.setPrice(BigDecimal.valueOf(100));
        dto.setQuantity(1);
        dto.setCategoryId(1L);

        CategoryEntity cat = new CategoryEntity();
        cat.setId(1L);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));

        ProductEntity saved = new ProductEntity();
        saved.setId(10L);
        saved.setName("Test");
        when(productRepository.save(any())).thenReturn(saved);

        // 🌟 SỬA LỖI Ở ĐÂY:
        // Bỏ tham số 'null' vì phương thức addProduct đã được cập nhật
        ProductDto result = productService.addProduct(dto);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(productRepository, times(1)).save(any());
    }

    @Test
    void getProductById_success() {
        ProductEntity entity = new ProductEntity();
        entity.setId(5L);
        entity.setName("P");
        entity.setDescription("D");
        entity.setPrice(BigDecimal.valueOf(50));
        entity.setQuantity(2);

        when(productRepository.findById(5L)).thenReturn(Optional.of(entity));

        ProductDto dto = productService.getProductById(5L);

        assertNotNull(dto);
        assertEquals(5L, dto.getId());
        assertEquals("P", dto.getName());
    }

    @Test
    void getProductById_notFound_throws() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    void getAllProducts_countMatches() {
        ProductEntity a = new ProductEntity();
        a.setId(1L);
        ProductEntity b = new ProductEntity();
        b.setId(2L);
        when(productRepository.findAll()).thenReturn(List.of(a, b));

        List<ProductDto> all = productService.getAllProducts();
        assertEquals(2, all.size());
    }
}
