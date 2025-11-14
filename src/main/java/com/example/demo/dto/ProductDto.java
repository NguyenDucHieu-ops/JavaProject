package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List; // ✅ Thêm dòng này

@Data
public class ProductDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price; // Giá gốc
    private Integer quantity;
    private Long categoryId;
    private String categoryName;
    private String imageUrl; // thêm trường trả về URL ảnh
    private List<ProductSizeDto> sizes;

    // ✅ MỚI: Thêm giá khuyến mãi
    private BigDecimal salePrice;
}