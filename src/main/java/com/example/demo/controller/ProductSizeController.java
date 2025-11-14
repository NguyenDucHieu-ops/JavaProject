package com.example.demo.controller;

import com.example.demo.dto.ProductSizeDto;
import com.example.demo.entity.ProductEntity;
import com.example.demo.entity.ProductSizeEntity;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ProductSizeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/product-sizes")
@RequiredArgsConstructor
public class ProductSizeController {

    private final ProductRepository productRepository;
    private final ProductSizeRepository productSizeRepository;

    // ✅ Lấy danh sách size theo product_id
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_ADMIN')")
    public ResponseEntity<List<ProductSizeDto>> getByProductId(@RequestParam("product_id") Long productId) {
        List<ProductSizeEntity> sizes = productSizeRepository.findByProductId(productId);

        List<ProductSizeDto> result = sizes.stream()
                .map(size -> ProductSizeDto.builder()
                        .id(size.getId())
                        .size(size.getSize())
                        .stock(size.getStock())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ✅ Thêm size cho sản phẩm
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ProductSizeDto> addSize(@RequestParam("product_id") Long productId,
            @RequestBody ProductSizeDto dto) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + productId));

        ProductSizeEntity entity = ProductSizeEntity.builder()
                .size(dto.getSize())
                .stock(dto.getStock())
                .product(product)
                .build();

        ProductSizeEntity saved = productSizeRepository.save(entity);

        ProductSizeDto result = ProductSizeDto.builder()
                .id(saved.getId())
                .size(saved.getSize())
                .stock(saved.getStock())
                .build();

        return ResponseEntity.ok(result);
    }

    // ✅ Xóa size theo id
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteSize(@PathVariable Long id) {
        if (!productSizeRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productSizeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
