package com.example.notification_service;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationMessage {
    private String id;
    private Long userId;
    private String title;
    private String message;
    private String type; // e.g. "ORDER_STATUS", "PAYMENT_ALERT", "PROMO"
    private LocalDateTime timestamp;
}
