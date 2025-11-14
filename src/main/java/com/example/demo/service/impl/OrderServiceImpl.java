package com.example.demo.service.impl;

import com.example.demo.dto.OrderRequest;
import com.example.demo.entity.OrderEntity;
import com.example.demo.entity.OrderItemEntity;
import com.example.demo.entity.ProductEntity;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public OrderEntity createOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Giỏ hàng trống");
        }

        OrderEntity order = new OrderEntity();
        order.setFullName(request.getFullName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus("PENDING");

        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.CartItem ci : request.getItems()) {
            ProductEntity product = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại: " + ci.getProductId()));

            BigDecimal price = product.getPrice() != null ? product.getPrice() : BigDecimal.ZERO;
            BigDecimal sub = price.multiply(BigDecimal.valueOf(ci.getQuantity()));

            OrderItemEntity item = new OrderItemEntity();
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setPrice(price);
            item.setQuantity(ci.getQuantity());
            item.setSubTotal(sub);
            item.setImageUrl(product.getImageUrl() != null ? product.getImageUrl() : "/no-image.png");

            order.addItem(item);
            total = total.add(sub);

            Integer currentQty = product.getQuantity() != null ? product.getQuantity() : 0;
            if (currentQty < ci.getQuantity()) {
                throw new IllegalArgumentException("Không đủ hàng cho sản phẩm: " + product.getName());
            }

            product.setQuantity(currentQty - ci.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(total);
        if (request.getShippingFee() != null) {
            order.setTotalAmount(order.getTotalAmount().add(request.getShippingFee()));
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            order.setUsername(auth.getName());
        }

        return orderRepository.save(order);
    }

    @Override
    public List<OrderEntity> getAllOrders() {
        return orderRepository.findAll();
    }

    @Override
    public OrderEntity getOrderById(Long id) {
        return orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng ID: " + id));
    }

    @Override
    @Transactional
    public OrderEntity updateOrderStatus(Long id, String status) {
        OrderEntity order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    @Override
    public List<OrderEntity> getOrdersByUsername(String username) {
        return orderRepository.findByUsername(username);
    }

    // --- HÀM MỚI CHO DASHBOARD ---
    @Override
    public List<OrderEntity> getLatestOrders(int limit) {
        // Dùng hàm của Repository (limit mặc định là 5)
        return orderRepository.findFirst5ByOrderByCreatedAtDesc();
    }
}
