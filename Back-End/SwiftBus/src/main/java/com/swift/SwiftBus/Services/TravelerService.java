package com.swift.SwiftBus.Services;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.swift.SwiftBus.Model.Booking;
import com.swift.SwiftBus.Model.Feedback;
import com.swift.SwiftBus.Model.Trip;
import com.swift.SwiftBus.Repository.BookingRepository;
import com.swift.SwiftBus.Repository.FeedbackRepository;
import com.swift.SwiftBus.Repository.TripRepository;

import jakarta.transaction.Transactional;

@Service
public class TravelerService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    // Fetch all available trips (status = true)
    public List<Trip> getAvailableTrips(String origin, String destination, Date date, int passengers) {
    List<Trip> trips = tripRepository.findAvailableTrips(origin, destination, date , passengers);
    return trips.stream()
                .filter(trip -> trip.getAvailableSeats() >= passengers)
                .collect(Collectors.toList());
}


    // Book a trip and reduce available seats
    @Transactional
    public String bookTrip(Booking booking) {

        Trip trip = booking.getTrip();

        // Check if enough seats are available
        if (trip.getAvailableSeats() < booking.getPassengers()) {
            return "Booking failed: Not enough seats available.";
        }

        // Update trip's available seats
        int updatedSeats = trip.getAvailableSeats() - booking.getPassengers();
        trip.setAvailableSeats(updatedSeats);

        // Set booking details
        booking.setStatus("PENDING"); // Corrected the status
        booking.setBooking_date(new Date());
        booking.setPrice(trip.getPrice() * booking.getPassengers());

        // Save the booking
        bookingRepository.save(booking);

        // Save the updated trip
        tripRepository.save(trip);

        return "Trip booked successfully.";
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
}
