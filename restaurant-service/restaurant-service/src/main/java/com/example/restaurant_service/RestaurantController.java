package com.example.restaurant_service;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantRepository restaurantRepository;
    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants(@RequestParam(required = false) String cusine){
        if(cusine != null && !cusine.isEmpty()){
            return ResponseEntity.ok(restaurantRepository.findByCuisineContainingIgnoreCase(cusine));
        }
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getReataurantById(@PathVariable String id){
        return restaurantRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant){
        if (restaurant.getRating()==null){
            restaurant.setRating(4.5);
        }
        Restaurant saved = restaurantRepository.save(restaurant);
        return ResponseEntity.ok(saved);
    }
    @PostMapping("/{id}")
    public ResponseEntity<Restaurant> addMenuItem(@PathVariable String id, @RequestBody MenuItem item){
        return restaurantRepository.findById(id).map(restaurant -> {
        if(item.getId()==null){
            item.setId(UUID.randomUUID().toString());
        }
        if(item.getIsAvailable()==null){
            item.setIsAvailable(true);
        }
        restaurant.getMenuItems().add(item);
        Restaurant update = restaurantRepository.save(restaurant);
        return ResponseEntity.ok(update);
        }).orElse(ResponseEntity.notFound().build());
    }


    @PatchMapping("/{restaurantId}/menu/{itemId}/availability")
    public ResponseEntity<Restaurant> toggleItemAvailability(
            @PathVariable String restaurantId,
            @PathVariable String itemId,
            @RequestParam Boolean isAvailable) {

        return restaurantRepository.findById(restaurantId).map(restaurant -> {
            restaurant.getMenuItems().stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst()
                    .ifPresent(item -> item.setIsAvailable(isAvailable));

            Restaurant updated = restaurantRepository.save(restaurant);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

}