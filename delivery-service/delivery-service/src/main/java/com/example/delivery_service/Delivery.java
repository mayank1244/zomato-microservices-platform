package com.example.delivery_service;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;
    private Long driverId;
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    private LocalDateTime assignedAt;
    private LocalDateTime deliveredAt;

    @PrePersist
    protected void onCreate() {
        this.assignedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DeliveryStatus.ASSIGNED;
        }
    }
}
