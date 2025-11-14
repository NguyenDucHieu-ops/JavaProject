package com.example.demo.service;

import com.example.demo.dto.OrderRequest;
import com.example.demo.entity.OrderEntity;
import java.util.List;

public interface OrderService {
    OrderEntity createOrder(OrderRequest request);

    List<OrderEntity> getAllOrders();

    OrderEntity getOrderById(Long id);

    OrderEntity updateOrderStatus(Long id, String status);

    void deleteOrder(Long id);

    List<OrderEntity> getOrdersByUsername(String username);

    // --- HÀM MỚI CHO DASHBOARD ---
    List<OrderEntity> getLatestOrders(int limit);
}