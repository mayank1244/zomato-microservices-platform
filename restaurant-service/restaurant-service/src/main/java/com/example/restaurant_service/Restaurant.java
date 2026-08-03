package com.example.restaurant_service;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;
@Document(collection = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {
    @Id
    private String id;
    private String name;
    private String address;
    private String cuisine;
    private Double rating;
    private String imageUrl;
    private String ownerId;

    @Builder.Default
    private List<MenuItem>  menuItems = new ArrayList<>();
}
