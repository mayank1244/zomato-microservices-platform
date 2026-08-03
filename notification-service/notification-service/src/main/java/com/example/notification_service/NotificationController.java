package com.example.notification_service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    // Send a real-time notification to a user
    @PostMapping("/send")
    public ResponseEntity<NotificationMessage> sendNotification(@RequestBody NotificationMessage notification) {
        notification.setId(UUID.randomUUID().toString());
        notification.setTimestamp(LocalDateTime.now());

        // In a full production setup, this broadcasts via WebSocket / FCM Push
        System.out.println("ALERT SENT TO USER " + notification.getUserId() + ": " + notification.getMessage());

        return ResponseEntity.ok(notification);
    }
}
