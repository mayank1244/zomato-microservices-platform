package com.example.delivery_service;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.io.Serializable;

@RedisHash("driver_locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverLocation implements Serializable {

    @Id
    private Long driverId;
    private Double latitude;
    private Double longitude;
    private Long updatedAt;
}
