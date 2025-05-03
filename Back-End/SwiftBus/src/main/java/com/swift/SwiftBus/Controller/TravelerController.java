package com.swift.SwiftBus.Controller;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.swift.SwiftBus.Model.Booking;
import com.swift.SwiftBus.Model.Feedback;
import com.swift.SwiftBus.Model.SearchTrip;
import com.swift.SwiftBus.Model.Ticket;
import com.swift.SwiftBus.Model.Trip;
import com.swift.SwiftBus.Services.TravelerService;
import org.springframework.web.bind.annotation.RequestParam;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/traveler")
public class TravelerController {

    @Autowired
    private TravelerService travelerService;

    // Fetch all available trips
    @GetMapping("/trips")
public ResponseEntity<?> getAvailableTrips() {
    return ResponseEntity.ok(travelerService.getAvailableTrips());
}

@PostMapping("/trips/search")
    public ResponseEntity<List<Trip>> searchTrips(@RequestBody SearchTrip searchTrip) {
        List<Trip> trips = travelerService.searchTrips(searchTrip);
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/trips/origins")
    public ResponseEntity<List<String>> getDistinctOrigins() {
        return ResponseEntity.ok(travelerService.getDistinctOrigins());
    }

    @GetMapping("/trips/destinations")
    public ResponseEntity<List<String>> getDistinctDestinations() {
        return ResponseEntity.ok(travelerService.getDistinctDestinations());
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

    @PutMapping("/cancel-booking/{bookingId}")
    public ResponseEntity<String> cancelBooking(@PathVariable int bookingId) {
        try {
            return travelerService.cancelBooking(bookingId);
        } catch (Exception e) {
            // Handle unexpected errors, e.g., database issues
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while canceling the booking.");
        }
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

@GetMapping("/download-ticket/{bookingId}")
public ResponseEntity<?> downloadTicket(@PathVariable int bookingId) {
    byte[] pdfFile = travelerService.downloadTicket(bookingId);

    if (pdfFile == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
               .body("Ticket not found for booking ID: " + bookingId);
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDisposition(ContentDisposition.builder("attachment")
               .filename("ticket_" + bookingId + ".pdf").build());
    
    return new ResponseEntity<>(pdfFile, headers, HttpStatus.OK);
}


    @GetMapping("/tickets/{userId}")
    public List<Ticket> getTicketsByUserId(@PathVariable int userId) {

        return travelerService.getTicketsByUserId(userId);
    }

}
