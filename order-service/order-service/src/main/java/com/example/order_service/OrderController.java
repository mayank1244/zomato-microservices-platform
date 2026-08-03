package com.example.order_service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    // 1. Place a new order & publish Kafka event
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order) {
        // Calculate total amount from items
        double total = order.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);
        // Publish OrderCreatedEvent to Kafka topic "order-events"
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .customerId(savedOrder.getCustomerId())
                .restaurantId(savedOrder.getRestaurantId())
                .totalAmount(savedOrder.getTotalAmount())
                .build();
        kafkaTemplate.send("order-events", event);
        return ResponseEntity.ok(savedOrder);
    }
    // 2. Get customer order history
    @GetMapping("/user/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderRepository.findByCustomerId(customerId));
    }
    // 3. Get restaurant orders (for kitchen view)
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Order>> getRestaurantOrders(@PathVariable String restaurantId) {
        return ResponseEntity.ok(orderRepository.findByRestaurantId(restaurantId));
    }
    // 4. Update order status (CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED)
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        return orderRepository.findById(orderId).map(order -> {
            order.setStatus(status);
            Order updated = orderRepository.save(order);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}