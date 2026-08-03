package com.example.restaurant_service;
import lombok.*;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItem {
    private String id;
    private String name;
    private String description;
    private String price;
    private String category;
    private String isVeg;
    private Boolean isAvailable;
}
