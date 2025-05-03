package com.swift.SwiftBus.Services;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.CrudRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.swift.SwiftBus.Model.Booking;
import com.swift.SwiftBus.Model.Feedback;
import com.swift.SwiftBus.Model.SearchTrip;
import com.swift.SwiftBus.Model.Ticket;
import com.swift.SwiftBus.Model.Trip;
import com.swift.SwiftBus.Model.User;
import com.swift.SwiftBus.Repository.BookingRepository;
import com.swift.SwiftBus.Repository.FeedbackRepository;
import com.swift.SwiftBus.Repository.TicketRepository;
import com.swift.SwiftBus.Repository.TripRepository;
import com.swift.SwiftBus.Repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class TravelerService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Trip> getAvailableTrips() {
        return tripRepository.findByStatusTrue();
    }

    // Fetch all available trips (status = true)
    
    public List<Trip> searchTrips(SearchTrip searchTrip) {
        return tripRepository.searchTrip(
            searchTrip.getOrigin(),
            searchTrip.getDestination(),
            searchTrip.getDate(),
            searchTrip.getPassengers()
        );
    }

    public List<String> getDistinctOrigins() {
        return tripRepository.findDistinctOrigins();
    }

    public List<String> getDistinctDestinations() {
        return tripRepository.findDistinctDestinations();
    }

    // Book a trip and reduce available seats
    @Transactional
    public String bookTrip(Booking booking) {
        try {
            
            // Validate user and trip existence
            User user = userRepository.findById(booking.getUser().getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Trip trip = tripRepository.findById(booking.getTrip().getTripId())
                    .orElseThrow(() -> new RuntimeException("Trip not found"));
    
            // Update trip's available seats
            int updatedSeats = trip.getAvailableSeats() - booking.getPassengers();
            trip.setAvailableSeats(updatedSeats);
    
            // Set booking details
            booking.setStatus("PENDING");
            booking.setBooking_date(new Date());  // Automatically set to current date
            booking.setPrice(trip.getPrice() * booking.getPassengers());
    
            // Save the booking and the updated trip
            bookingRepository.save(booking);
            tripRepository.save(trip);
    
            return "Trip booked successfully.";
        } catch (Exception e) {
            // Handle errors and provide a response
            e.printStackTrace();
            return "Booking failed: " + e.getMessage();
        }
    }
    

    public ResponseEntity<String> cancelBooking(int bookingId) {
    Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);

    if (optionalBooking.isPresent()) {
        Booking booking = optionalBooking.get();
        
        // Check if the booking is already canceled to avoid redundant updates
        if ("CANCELLED".equals(booking.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("Booking is already cancelled.");
        }

        // Update status to CANCELLED
        booking.setStatus("CANCELLED");

        // Save the updated booking
        bookingRepository.save(booking);

        return ResponseEntity.ok("Booking cancelled successfully.");
    } else {
        // Return error response if booking not found
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                             .body("Booking with ID " + bookingId + " not found.");
    }
}

    

    // Get all bookings for a user
    public List<Booking> getBookingHistory(int userId) {
        return bookingRepository.findByUser_UserId(userId);
    }

    // Get booking status by booking ID
    public String getBookingStatus(int bookingId) {
        return bookingRepository.findById(bookingId)
                .map(Booking::getStatus)
                .orElse("Booking not found.");
    }

    // Submit user feedback
    public String submitFeedback(Feedback feedback) {
        if (feedback.getUser() == null || feedback.getTrip() == null) {
            return "Feedback submission failed: Missing user or trip.";
        }

        feedbackRepository.save(feedback);
        return "Feedback submitted successfully.";
    }

    public byte[] downloadTicket(int bookingId) {
        Optional<Ticket> ticket = ticketRepository.findByBookingId(bookingId);
        if (!ticket.isPresent()) {
            // Return null or throw an exception if ticket not found
            return null;
        }
        return ticket.get().getPdfFile(); // Return the PDF byte array
    }
    

    public List<Ticket> getTicketsByUserId(int userId) {
        return ticketRepository.findByUser_UserId(userId);
    }

    
}
