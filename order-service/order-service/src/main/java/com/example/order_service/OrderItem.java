package com.example.order_service;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String menuItemId;
    private String itemName;
    private Double price;
    private Integer quantity;
}
