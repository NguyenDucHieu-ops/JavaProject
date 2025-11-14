package com.example.demo.repository;

import com.example.demo.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    // --- CÁC HÀM MỚI VỚI JOIN FETCH (ĐỂ SỬA LỖI 500) ---

    @Query("SELECT DISTINCT p FROM ProductEntity p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.sizes WHERE p.category.id = :categoryId")
    List<ProductEntity> findByCategoryIdWithCategory(@Param("categoryId") Long categoryId);

    @Query("SELECT DISTINCT p FROM ProductEntity p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.sizes WHERE p.name LIKE %:keyword%")
    List<ProductEntity> findByNameContainingIgnoreCaseWithCategory(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT p FROM ProductEntity p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.sizes WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<ProductEntity> findByPriceBetweenWithCategory(@Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT DISTINCT p FROM ProductEntity p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.sizes")
    List<ProductEntity> findAllForExport(); // (Dùng cho cả getAllProducts và Export)

    // --- HÀM THỐNG KÊ (Giữ nguyên) ---
    @Query("SELECT c.name, COUNT(p.id) FROM ProductEntity p JOIN p.category c GROUP BY c.id, c.name")
    List<Object[]> countProductsByCategory();

    // --- HÀM MỚI CHO DASHBOARD ---
    // Tự động lấy 5 sản phẩm mới nhất (theo ID giảm dần)
    List<ProductEntity> findFirst5ByOrderByIdDesc();
}
