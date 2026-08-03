package com.example.delivery_service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    // 1. Assign a driver to an order
    @PostMapping("/assign")
    public ResponseEntity<Delivery> assignDelivery(@RequestBody Delivery delivery) {
        Delivery saved = deliveryRepository.save(delivery);
        return ResponseEntity.ok(saved);
    }

    // 2. Update delivery status (PICKED_UP, DELIVERED)
    @PatchMapping("/{deliveryId}/status")
    public ResponseEntity<Delivery> updateStatus(
            @PathVariable Long deliveryId,
            @RequestParam DeliveryStatus status) {

        return deliveryRepository.findById(deliveryId).map(delivery -> {
            delivery.setStatus(status);
            if (status == DeliveryStatus.DELIVERED) {
                delivery.setDeliveredAt(LocalDateTime.now());
            }
            Delivery updated = deliveryRepository.save(delivery);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. Get delivery details for an order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Delivery> getDeliveryByOrderId(@PathVariable Long orderId) {
        return deliveryRepository.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. Update Driver GPS Location in Redis
    @PostMapping("/location")
    public ResponseEntity<String> updateDriverLocation(@RequestBody DriverLocation location) {
        location.setUpdatedAt(System.currentTimeMillis());
        redisTemplate.opsForValue().set("DRIVER_LOC:" + location.getDriverId(), location);
        return ResponseEntity.ok("Location updated in Redis");
    }

    // 5. Get Driver GPS Location from Redis
    @GetMapping("/location/{driverId}")
    public ResponseEntity<Object> getDriverLocation(@PathVariable Long driverId) {
        Object location = redisTemplate.opsForValue().get("DRIVER_LOC:" + driverId);
        if (location != null) {
            return ResponseEntity.ok(location);
        }
        return ResponseEntity.notFound().build();
    }
}
