package com.example.demo.mapper;

import com.example.demo.dto.ProductDto;
import com.example.demo.dto.ProductSizeDto;
import com.example.demo.entity.CategoryEntity;
import com.example.demo.entity.ProductEntity;
import com.example.demo.entity.ProductSizeEntity;

import java.util.stream.Collectors;

public class ProductMapper {

    // 🟢 Entity → DTO
    public static ProductDto toDto(ProductEntity entity) {
        if (entity == null)
            return null;

        ProductDto dto = new ProductDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setQuantity(entity.getQuantity());
        dto.setPrice(entity.getPrice());
        dto.setImageUrl(entity.getImageUrl());

        // ✅ MỚI: Thêm salePrice
        dto.setSalePrice(entity.getSalePrice());

        if (entity.getCategory() != null) {
            dto.setCategoryId(entity.getCategory().getId());
            dto.setCategoryName(entity.getCategory().getName());
        }

        // ✅ Map sizes
        if (entity.getSizes() != null) {
            dto.setSizes(entity.getSizes().stream()
                    .map(size -> ProductSizeDto.builder()
                            .id(size.getId())
                            .size(size.getSize())
                            .stock(size.getStock())
                            .build())
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    // 🟣 DTO → Entity
    public static ProductEntity toEntity(ProductDto dto, CategoryEntity category) {
        if (dto == null)
            return null;

        ProductEntity entity = new ProductEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setQuantity(dto.getQuantity());
        entity.setPrice(dto.getPrice());
        entity.setCategory(category);
        entity.setImageUrl(dto.getImageUrl());

        // ✅ MỚI: Thêm salePrice
        entity.setSalePrice(dto.getSalePrice());

        // ✅ Map sizes
        if (dto.getSizes() != null) {
            entity.setSizes(dto.getSizes().stream()
                    .map(sizeDto -> ProductSizeEntity.builder()
                            .size(sizeDto.getSize())
                            .stock(sizeDto.getStock())
                            .product(entity)
                            .build())
                    .collect(Collectors.toList()));
        }

        return entity;
    }
}