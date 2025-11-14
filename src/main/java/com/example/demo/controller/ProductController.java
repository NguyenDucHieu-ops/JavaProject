package com.example.demo.controller;

import com.example.demo.dto.ProductDto;
import com.example.demo.service.ExcelService;
import com.example.demo.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Validated
public class ProductController {

    private final ProductService productService;
    private final ExcelService excelService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<ProductDto>>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal min,
            @RequestParam(required = false) BigDecimal max) {

        List<ProductDto> list;
        if (keyword != null && !keyword.trim().isEmpty()) {
            list = productService.searchByName(keyword);
        } else if (min != null && max != null) {
            list = productService.findByPriceBetween(min, max);
        } else {
            list = productService.getAllProducts();
        }

        List<EntityModel<ProductDto>> products = list.stream()
                .map(this::addLinksToProduct)
                .collect(Collectors.toList());

        return ResponseEntity.ok(CollectionModel.of(
                products,
                linkTo(methodOn(ProductController.class).getAllProducts(keyword, min, max)).withSelfRel()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto dto = productService.getProductById(id);
        EntityModel<ProductDto> model = addLinksToProduct(dto);
        return ResponseEntity.ok(model);
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<CollectionModel<EntityModel<ProductDto>>> getProductsByCategory(@PathVariable Long id) {
        List<EntityModel<ProductDto>> products = productService.getProductsByCategory(id).stream()
                .map(this::addLinksToProduct)
                .collect(Collectors.toList());

        return ResponseEntity.ok(CollectionModel.of(
                products,
                linkTo(methodOn(ProductController.class).getProductsByCategory(id)).withSelfRel()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<EntityModel<ProductDto>> createProduct(@Validated @RequestBody ProductDto productDto) {
        ProductDto created = productService.addProduct(productDto);
        EntityModel<ProductDto> model = addLinksToProduct(created);
        return ResponseEntity.created(model.getRequiredLink("self").toUri()).body(model);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<EntityModel<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Validated @RequestBody ProductDto productDto) {
        ProductDto updated = productService.updateProduct(id, productDto);
        EntityModel<ProductDto> model = addLinksToProduct(updated);
        return ResponseEntity.ok(model);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/plain")
    public ResponseEntity<List<ProductDto>> getAllProductsPlain(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal min,
            @RequestParam(required = false) BigDecimal max) {

        List<ProductDto> list;
        if (keyword != null && !keyword.trim().isEmpty()) {
            list = productService.searchByName(keyword);
        } else if (min != null && max != null) {
            list = productService.findByPriceBetween(min, max);
        } else {
            list = productService.getAllProducts();
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getProductStats() {
        return ResponseEntity.ok(productService.getProductStats());
    }

    // --- ENDPOINT MỚI CHO DASHBOARD ---
    @GetMapping("/latest")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<ProductDto>> getLatestProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(productService.getLatestProducts(limit));
    }

    @PostMapping("/import-excel")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            excelService.save(file);
            return ResponseEntity.ok("File imported successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to import file: " + e.getMessage());
        }
    }

    @GetMapping("/export-excel")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public void exportExcel(HttpServletResponse response) throws IOException {
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");
        String currentDateTime = dateFormatter.format(new Date());

        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=products_export_" + currentDateTime + ".xlsx";
        response.setHeader(headerKey, headerValue);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        ByteArrayInputStream bis = excelService.load();
        response.getOutputStream().write(bis.readAllBytes());
        bis.close();
    }

    private EntityModel<ProductDto> addLinksToProduct(ProductDto dto) {
        EntityModel<ProductDto> model = EntityModel.of(dto,
                linkTo(methodOn(ProductController.class).getProductById(dto.getId())).withSelfRel(),
                linkTo(methodOn(ProductController.class).getAllProducts(null, null, null)).withRel("all-products"));

        if (dto.getCategoryId() != null) {
            try {
                model.add(linkTo(methodOn(CategoryController.class)
                        .getCategoryById(dto.getCategoryId()))
                        .withRel("category"));
            } catch (Exception ignored) {
            }
        }
        return model;
    }
}
