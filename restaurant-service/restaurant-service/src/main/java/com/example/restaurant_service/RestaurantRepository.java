package com.example.restaurant_service;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface RestaurantRepository extends MongoRepository<Restaurant,String> {
    List<Restaurant> findByOwnerId(Long ownerId);
    List<Restaurant> findByCuisineContainingIgnoreCase(String cuisine);
}
