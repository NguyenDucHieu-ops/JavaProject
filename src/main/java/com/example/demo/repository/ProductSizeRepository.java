package com.example.demo.repository;

import com.example.demo.entity.ProductSizeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductSizeRepository extends JpaRepository<ProductSizeEntity, Long> {
    List<ProductSizeEntity> findByProductId(Long productId);
}
