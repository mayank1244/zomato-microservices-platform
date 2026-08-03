package com.example.order_service;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class OrderCreatedEvent {

    private Long orderId;
    private Long customerId;
    private String restaurantId;
    private Double totalAmount;


}
