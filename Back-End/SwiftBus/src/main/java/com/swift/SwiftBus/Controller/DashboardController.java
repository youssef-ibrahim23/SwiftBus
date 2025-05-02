package com.swift.SwiftBus.Controller;

import com.swift.SwiftBus.Model.Booking;
import com.swift.SwiftBus.Services.AdminServices;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@Tag(name = "Dashboard API", description = "Endpoints for dashboard statistics and information")
public class DashboardController {

    @Autowired
     AdminServices adminServices;

    @GetMapping("/stats")
    @Operation(summary = "Get all dashboard statistics",
               description = "Returns a consolidated view of all dashboard metrics",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Successfully retrieved dashboard stats",
                               content = @Content(schema = @Schema(implementation = Map.class)))
               })
    public ResponseEntity<Map<String, Integer>> getDashboardStats() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("totalTrips", adminServices.numberOfTrips());
        stats.put("totalUsers", adminServices.numberOfUsers());
        stats.put("totalFeedbacks", adminServices.numberOfFeedbacks());
        stats.put("pendingBookings", adminServices.numberOfPendingBookings());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/trips/count")
    @Operation(summary = "Get total trips count",
               description = "Returns the total number of trips in the system")
    public ResponseEntity<Integer> getTotalTrips() {
        return ResponseEntity.ok(adminServices.numberOfTrips());
    }

    @GetMapping("/users/count")
    @Operation(summary = "Get total users count",
               description = "Returns the total number of users in the system")
    public ResponseEntity<Integer> getTotalUsers() {
        return ResponseEntity.ok(adminServices.numberOfUsers());
    }

    @GetMapping("/feedbacks/count")
    @Operation(summary = "Get total feedbacks count",
               description = "Returns the total number of feedbacks in the system")
    public ResponseEntity<Integer> getTotalFeedbacks() {
        return ResponseEntity.ok(adminServices.numberOfFeedbacks());
    }

    @GetMapping("/bookings/pending/count")
    @Operation(summary = "Get pending bookings count",
               description = "Returns the number of bookings with PENDING status")
    public ResponseEntity<Integer> getPendingBookingsCount() {
        return ResponseEntity.ok(adminServices.numberOfPendingBookings());
    }

    @GetMapping("/bookings/pending")
    @Operation(summary = "Get all pending bookings",
               description = "Returns a list of all bookings with PENDING status",
               responses = {
                   @ApiResponse(responseCode = "200", description = "Successfully retrieved pending bookings",
                               content = @Content(schema = @Schema(implementation = Booking.class)))
               })
    public ResponseEntity<List<Booking>> getPendingBookings() {
        return ResponseEntity.ok(adminServices.viewAllBookingRequests());
    }
}