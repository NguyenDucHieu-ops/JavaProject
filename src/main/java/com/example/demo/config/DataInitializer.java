package com.example.demo.config;

import com.example.demo.entity.CategoryEntity;
import com.example.demo.entity.ProductEntity;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0 && productRepository.count() == 0) {
            System.out.println("Initializing sample data for products and categories...");

            CategoryEntity electronics = new CategoryEntity();
            electronics.setName("Electronics");

            CategoryEntity books = new CategoryEntity();
            books.setName("Books");
            categoryRepository.saveAll(List.of(electronics, books));

            ProductEntity laptop = new ProductEntity();
            laptop.setName("Laptop Pro");
            laptop.setDescription("A powerful laptop for professionals.");
            laptop.setQuantity(50);
            laptop.setPrice(new BigDecimal("1200.00"));
            laptop.setCategory(electronics);

            ProductEntity smartphone = new ProductEntity();
            smartphone.setName("Smartphone X");
            smartphone.setDescription("The latest smartphone with amazing features.");
            smartphone.setQuantity(150);
            smartphone.setPrice(new BigDecimal("800.00"));
            smartphone.setCategory(electronics);

            ProductEntity springInAction = new ProductEntity();
            springInAction.setName("Spring in Action");
            springInAction.setDescription("A must-read for Spring developers.");
            springInAction.setQuantity(100);
            springInAction.setPrice(new BigDecimal("50.00"));
            springInAction.setCategory(books);

            productRepository.saveAll(List.of(laptop, smartphone, springInAction));

            System.out.println("Sample data initialized.");
        }
    }
}
