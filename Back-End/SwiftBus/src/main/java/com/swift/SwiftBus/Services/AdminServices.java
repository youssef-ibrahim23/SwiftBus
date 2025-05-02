package com.swift.SwiftBus.Services;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import com.swift.SwiftBus.Model.*;
import com.swift.SwiftBus.Model.User.Role;
import com.swift.SwiftBus.Repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServices {

    private static final Logger logger = LoggerFactory.getLogger(AdminServices.class);
    
    @Autowired
    private TripRepository tripRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private BusRepository busRepository;
    @Autowired
    private TicketRepository ticketRepository;

    // ==================== DASHBOARD METHODS ====================
    public int numberOfTrips() {
        return tripRepository.findAll().size();
    }

    public int numberOfUsers() {
        return userRepository.findAll().size();
    }

    public int numberOfPendingBookings() {
        return bookingRepository.findAll().stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getStatus()))
                .collect(Collectors.toList()).size();
    }

    public int numberOfFeedbacks() {
        return feedbackRepository.findAll().size();
    }

    // ==================== TRIP MANAGEMENT ====================
    public List<Trip> viewAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTrip(int tripId) {
        return tripRepository.findById(tripId).orElse(null);
    }

    public Trip addTrip(Trip trip) {
        Bus bus = busRepository.findById(trip.getBus().getBusId())
                .orElseThrow(() -> new RuntimeException("Bus not found"));
        User driver = userRepository.findById(bus.getDriver().getUserId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        trip.setBus(bus);
        trip.setDriver(driver);
        trip.setTotalSeats(bus.getCapacity());
        trip.setAvailableSeats(bus.getCapacity());
        trip.setStatus(true);

        return tripRepository.save(trip);
    }

    public Optional<Trip> updateTrip(Trip trip) {
        if (!tripRepository.existsById(trip.getTripId())) {
            return Optional.empty();
        }

        if (trip.getPrice() < 0) {
            logger.warn("Invalid price value for Trip ID {}", trip.getTripId());
            return Optional.empty();
        }

        return Optional.of(tripRepository.save(trip));
    }

    public boolean deleteTrip(int id) {
        if (tripRepository.existsById(id)) {
            tripRepository.deleteById(id);
            return true;
        }
        logger.warn("Trip with ID {} not found", id);
        return false;
    }

    // ==================== USER MANAGEMENT ====================
    public List<User> viewAllUsers() {
        return userRepository.findAll();
    }

    public User addDriver(User user) {
        user.setRole(Role.DRIVER);
        return userRepository.save(user);
    }

    public User updateDriver(User user) {
        return userRepository.save(user);
    }

    public boolean deleteDriver(int id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        logger.warn("Driver with ID {} not found", id);
        return false;
    }

    // ==================== BOOKING MANAGEMENT ====================
    public List<Booking> viewAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> viewAllBookingRequests() {
        return bookingRepository.findAll().stream()
                .filter(b -> "PENDING".equalsIgnoreCase(b.getStatus()))
                .collect(Collectors.toList());
    }

    public boolean approveBooking(int id) {
        boolean result = updateBookingStatus(id, "APPROVED");
        if (result) {
            generateTicketPdf(id);
        }
        return result;
    }

    public boolean rejectBooking(int id) {
        return updateBookingStatus(id, "REJECT");
    }

    private boolean updateBookingStatus(int bookingId, String status) {
        return bookingRepository.findById(bookingId)
                .map(b -> {
                    b.setStatus(status);
                    bookingRepository.save(b);
                    return true;
                })
                .orElseGet(() -> {
                    logger.warn("Booking not found with ID: {}", bookingId);
                    return false;
                });
    }

    // ==================== TICKET GENERATION ====================
    public Ticket generateTicketPdf(int bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        Trip trip = tripRepository.findById(booking.getTrip().getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setTrip(trip);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
            Font regularFont = new Font(Font.FontFamily.HELVETICA, 12);

            // Ticket Header
            document.add(new Paragraph("SWIFTBUS - E-TICKET", titleFont));
            document.add(new Paragraph(" "));
            
            // Booking Information
            document.add(new Paragraph("Ticket Number: " + ticket.getTicketId(), headerFont));
            document.add(new Paragraph("Booking Date: " + booking.getBooking_date(), regularFont));
            document.add(new Paragraph(" "));

            // Passenger Information
            document.add(new Paragraph("Passenger Information", headerFont));
            document.add(new Paragraph("Name: " + booking.getUser().getUserName(), regularFont));
            document.add(new Paragraph("Passengers: " + booking.getPassengers(), regularFont));
            document.add(new Paragraph(" "));

            // Trip Details
            document.add(new Paragraph("Trip Details", headerFont));
            document.add(new Paragraph("Route: " + trip.getOrigin() + " to " + trip.getDestination(), regularFont));
            document.add(new Paragraph("Date: " + trip.getDate(), regularFont));
            document.add(new Paragraph("Duration: " + trip.getDuration(), regularFont));
            document.add(new Paragraph("Bus: " + trip.getBus().getModel(), regularFont));
            document.add(new Paragraph(" "));

            // Fare Information
            document.add(new Paragraph("Fare Information", headerFont));
            document.add(new Paragraph("Total Amount: $" + booking.getPrice(), regularFont));
            document.add(new Paragraph("Status: " + booking.getStatus(), regularFont));
            document.add(new Paragraph(" "));

            document.close();
            ticket.setPdfFile(outputStream.toByteArray());
            return ticketRepository.save(ticket);

        } catch (DocumentException | IOException e) {
            logger.error("Failed to generate ticket PDF for booking ID: {}", bookingId, e);
            throw new RuntimeException("Failed to generate ticket PDF", e);
        }
    }

    // ==================== FEEDBACK MANAGEMENT ====================
    public List<Feedback> viewAllFeedbacks() {
        return feedbackRepository.findAll();
    }

    // ==================== BUS MANAGEMENT ====================
    public List<Bus> viewAllBuses() {
        return busRepository.findAll();
    }

    public Bus addBus(Bus bus) {
        return busRepository.save(bus);
    }

    public Optional<Bus> updateBus(Bus updatedBus) {
        if (!busRepository.existsById(updatedBus.getBusId())) {
            return Optional.empty();
        }
        return Optional.of(busRepository.save(updatedBus));
    }

    public boolean deleteBus(int busId) {
        if (busRepository.existsById(busId)) {
            busRepository.deleteById(busId);
            return true;
        }
        return false;
    }
}