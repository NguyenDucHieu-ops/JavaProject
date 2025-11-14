package com.example.demo.controller;

import com.example.demo.dto.OrderRequest;
import com.example.demo.entity.OrderEntity;
import com.example.demo.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request) {
        try {
            OrderEntity order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi tạo đơn hàng");
        }
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<OrderEntity> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi lấy danh sách đơn hàng");
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            OrderEntity order = orderService.getOrderById(id);
            if (order == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(order);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi lấy đơn hàng");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> updateOrder(@PathVariable Long id, @RequestBody OrderEntity updateData) {
        try {
            OrderEntity updated = orderService.updateOrderStatus(id, updateData.getStatus());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi cập nhật đơn hàng");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok("Đã xóa đơn hàng " + id);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi xóa đơn hàng");
        }
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        try {
            String username = authentication.getName();
            List<OrderEntity> orders = orderService.getOrdersByUsername(username);
            return ResponseEntity.ok(orders);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi lấy lịch sử đơn hàng");
        }
    }

    // --- ENDPOINT MỚI CHO DASHBOARD ---
    @GetMapping("/latest")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> getLatestOrders(@RequestParam(defaultValue = "5") int limit) {
        try {
            List<OrderEntity> orders = orderService.getLatestOrders(limit);
            return ResponseEntity.ok(orders);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi lấy 5 đơn hàng mới nhất");
        }
    }
}
