package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private Integer quantity;

    private BigDecimal price; // Giá gốc

    @Column(name = "image_url")
    private String imageUrl; // 🖼️ Lưu đường dẫn ảnh

    // ✅ MỚI: Thêm giá khuyến mãi
    @Column(precision = 15, scale = 2)
    private BigDecimal salePrice;

    // 🔗 Quan hệ N-1 với Category
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    // 🔗 Quan hệ 1-N với ProductSizeEntity
    @JsonManagedReference
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductSizeEntity> sizes = new ArrayList<>();
}