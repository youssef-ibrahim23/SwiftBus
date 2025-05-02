package com.swift.SwiftBus.Controller;

import com.swift.SwiftBus.Model.*;
import com.swift.SwiftBus.Model.User.Role;
import com.swift.SwiftBus.Services.AdminServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    @Autowired
     AdminServices adminServices;


    // ==================== TRIP MANAGEMENT ====================
    @GetMapping("/trips")
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(adminServices.viewAllTrips());
    }

    @GetMapping("/trips/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable int id) {
        Trip trip = adminServices.getTrip(id);
        return trip != null 
            ? ResponseEntity.ok(trip) 
            : ResponseEntity.notFound().build();
    }

    @PostMapping("/trips")
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        Trip createdTrip = adminServices.addTrip(trip);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTrip);
    }

    @PutMapping("/trips")
    public ResponseEntity<Trip> updateTrip(@RequestBody Trip trip) {
        Optional<Trip> updatedTrip = adminServices.updateTrip(trip);
        return updatedTrip
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/trips/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable int id) {
        return adminServices.deleteTrip(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ==================== USER MANAGEMENT ====================
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminServices.viewAllUsers());
    }

    @PostMapping("/drivers")
    public ResponseEntity<User> createDriver(@RequestBody User user) {
        user.setRole(Role.DRIVER);
        User createdDriver = adminServices.addDriver(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDriver);
    }

    @PutMapping("/drivers")
    public ResponseEntity<User> updateDriver(@RequestBody User user) {
        User updatedDriver = adminServices.updateDriver(user);
        return ResponseEntity.ok(updatedDriver);
    }

    @DeleteMapping("/drivers/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable int id) {
        return adminServices.deleteDriver(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ==================== BOOKING MANAGEMENT ====================
    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(adminServices.viewAllBookings());
    }

    @GetMapping("/bookings/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        return ResponseEntity.ok(adminServices.viewAllBookingRequests());
    }

    

    @PutMapping("/bookings/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable int id) {
        boolean approved = adminServices.approveBooking(id);
        if (approved) {
            Ticket ticket = adminServices.generateTicketPdf(id);
            byte[] pdfBytes = ticket.getPdfFile();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData(
                "attachment", 
                "ticket_" + id + ".pdf"
            );
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/bookings/{id}/reject")
    public ResponseEntity<Void> rejectBooking(@PathVariable int id) {
        return adminServices.rejectBooking(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    // ==================== TICKET MANAGEMENT ====================
    @GetMapping("/tickets/{bookingId}")
    public ResponseEntity<byte[]> getTicketPdf(@PathVariable int bookingId) {
        Ticket ticket = adminServices.generateTicketPdf(bookingId);
        byte[] pdfBytes = ticket.getPdfFile();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData(
            "attachment", 
            "ticket_" + bookingId + ".pdf"
        );

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // ==================== FEEDBACK MANAGEMENT ====================
    @GetMapping("/feedbacks")
    public ResponseEntity<List<Feedback>> getAllFeedbacks() {
        return ResponseEntity.ok(adminServices.viewAllFeedbacks());
    }

    // ==================== BUS MANAGEMENT ====================
    @GetMapping("/buses")
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(adminServices.viewAllBuses());
    }

    @PostMapping("/buses")
    public ResponseEntity<Bus> createBus(@RequestBody Bus bus) {
        Bus newBus = adminServices.addBus(bus);
        return ResponseEntity.status(HttpStatus.CREATED).body(newBus);
    }

    @PutMapping("/buses")
    public ResponseEntity<Bus> updateBus(@RequestBody Bus bus) {
        Optional<Bus> updatedBus = adminServices.updateBus(bus);
        return updatedBus
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/buses/{id}")
    public ResponseEntity<Void> deleteBus(@PathVariable int id) {
        return adminServices.deleteBus(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}