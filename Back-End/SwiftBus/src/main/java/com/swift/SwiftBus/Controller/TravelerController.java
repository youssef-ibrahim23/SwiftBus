package com.swift.SwiftBus.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.swift.SwiftBus.Model.Booking;
import com.swift.SwiftBus.Model.Feedback;
import com.swift.SwiftBus.Model.Trip;
import com.swift.SwiftBus.Services.TravelerService;

@RestController
@RequestMapping("/api/traveler")
public class TravelerController {

    @Autowired
    private TravelerService travelerService;

    // Fetch all available trips
    @GetMapping("/trips")
public ResponseEntity<List<Trip>> getAvailableTrips(
        @RequestParam String origin,
        @RequestParam String destination,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") java.util.Date date,
        @RequestParam int passengers) {

    List<Trip> trips = travelerService.getAvailableTrips(origin, destination, date, passengers);
    if (trips.isEmpty()) {
        return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(trips);
}

@GetMapping("/trips/all")
public String getMethodName(@RequestParam String param) {
    return new String();
}


    // Book a trip
    @PostMapping("/book-trip")
public ResponseEntity<String> bookTrip(@RequestBody Booking booking) {
    String response = travelerService.bookTrip(booking);

    // If booking was successful, return HTTP status 200 (OK)
    if (response.equals("Trip booked successfully.")) {
        return ResponseEntity.ok(response);
    }

    // In case of failure, return HTTP status 400 (Bad Request) or any other status depending on the failure reason
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
}


    // Get bookings by user ID
    @GetMapping("/booking-history/{userId}")
    public ResponseEntity<List<Booking>> getBookingHistory(@PathVariable int userId) {
        List<Booking> bookings = travelerService.getBookingHistory(userId);
        if (bookings.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(bookings);
    }

    // Get booking status by booking ID
    @GetMapping("/booking-status/{bookingId}")
    public ResponseEntity<String> getBookingStatus(@PathVariable int bookingId) {
        String status = travelerService.getBookingStatus(bookingId);
        return ResponseEntity.ok(status);
    }

    // Submit feedback
    @PostMapping("/submit-feedback")
    public ResponseEntity<String> submitFeedback(@RequestBody Feedback feedback) {
        String response = travelerService.submitFeedback(feedback);
        return ResponseEntity.ok(response);
    }
}
