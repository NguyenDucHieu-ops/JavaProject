package com.example.demo.mapper;

import com.example.demo.dto.CategoryDto;
import com.example.demo.entity.CategoryEntity;

public class CategoryMapper {
    public static CategoryDto toDto(CategoryEntity entity) {
        CategoryDto dto = new CategoryDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setImageUrl(entity.getImageUrl());
        return dto;
    }

    public static CategoryEntity toEntity(CategoryDto dto) {
        CategoryEntity entity = new CategoryEntity();
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setImageUrl(dto.getImageUrl());
        return entity;
    }
}
