package com.swift.SwiftBus.Services;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.text.pdf.draw.LineSeparator;
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
        int count = tripRepository.findAll().size();
        logger.info("Number of trips: {}", count);
        return count;
    }

    public int numberOfUsers() {
        int count = userRepository.findAll().size();
        logger.info("Number of users: {}", count);
        return count;
    }

    public int numberOfPendingBookings() {
        int count = bookingRepository.countByStatus("PENDING");
        logger.info("Number of pending bookings: {}", count);
        return count;
    }

    public int numberOfFeedbacks() {
        int count = feedbackRepository.findAll().size();
        logger.info("Number of feedbacks: {}", count);
        return count;
    }

    // ==================== TRIP MANAGEMENT ====================
    public List<Trip> viewAllTrips() {
        List<Trip> trips = tripRepository.findAll();
        logger.info("Fetched all trips, count: {}", trips.size());
        return trips;
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

        logger.info("Adding new trip with origin: {} and destination: {}", trip.getOrigin(), trip.getDestination());
        return tripRepository.save(trip);
    }

    public Optional<Trip> updateTrip(Trip trip) {
        if (!tripRepository.existsById(trip.getTripId())) {
            logger.warn("Trip with ID {} not found for update", trip.getTripId());
            return Optional.empty();
        }

        if (trip.getPrice() < 0) {
            logger.warn("Invalid price value for Trip ID {}", trip.getTripId());
            return Optional.empty();
        }

        logger.info("Updating trip with ID {}", trip.getTripId());
        return Optional.of(tripRepository.save(trip));
    }

    public boolean deleteTrip(int id) {
        if (tripRepository.existsById(id)) {
            logger.info("Deleting trip with ID {}", id);
            tripRepository.deleteById(id);
            return true;
        }
        logger.warn("Trip with ID {} not found", id);
        return false;
    }

    // ==================== USER MANAGEMENT ====================
    public List<User> viewAllUsers() {
        List<User> users = userRepository.findAll();
        logger.info("Fetched all users, count: {}", users.size());
        return users;
    }

    public User addDriver(User user) {
        user.setRole(Role.DRIVER);
        logger.info("Adding new driver: {}", user.getUserName());
        return userRepository.save(user);
    }

    public User updateDriver(User user) {
        logger.info("Updating driver with ID {}", user.getUserId());
        return userRepository.save(user);
    }

    public boolean deleteDriver(int id) {
        if (userRepository.existsById(id)) {
            logger.info("Deleting driver with ID {}", id);
            userRepository.deleteById(id);
            return true;
        }
        logger.warn("Driver with ID {} not found", id);
        return false;
    }

    // ==================== BOOKING MANAGEMENT ====================
    public List<Booking> viewAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        logger.info("Fetched all bookings, count: {}", bookings.size());
        return bookings;
    }

    public List<Booking> viewAllBookingRequests() {
        List<Booking> pendingBookings = bookingRepository.findByStatus("PENDING");
        logger.info("Fetched pending bookings, count: {}", pendingBookings.size());
        return pendingBookings;
    }

    public boolean approveBooking(int id) {
        boolean result = updateBookingStatus(id, "APPROVED");
        
        return result;
    }

    public boolean rejectBooking(int id) {
        boolean result = updateBookingStatus(id, "REJECTED");
        if (result) {
            logger.info("Booking ID {} rejected", id);
        }
        return result;
    }

    private boolean updateBookingStatus(int bookingId, String status) {
        return bookingRepository.findById(bookingId)
                .map(b -> {
                    b.setStatus(status);
                    bookingRepository.save(b);
                    b.getTrip().setAvailableSeats(b.getTrip().getAvailableSeats() - b.getPassengers());
                    tripRepository.save(b.getTrip()); // Missing semicolon was here
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

        User user = userRepository.findById(booking.getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Ticket ticket = new Ticket();
        ticket.setBooking(booking);
        ticket.setTrip(trip);
        ticket.setUser(user);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // Fonts
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
            Font regularFont = new Font(Font.FontFamily.HELVETICA, 12);
            Font smallFont = new Font(Font.FontFamily.HELVETICA, 10);

            // Title
            Paragraph title = new Paragraph("SWIFTBUS - E-TICKET", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            LineSeparator separator = new LineSeparator();
            separator.setOffset(-2);
            document.add(new Chunk(separator));
            document.add(Chunk.NEWLINE);

            // Booking Info Table
            PdfPTable bookingTable = new PdfPTable(2);
            bookingTable.setWidthPercentage(100);
            bookingTable.setSpacingBefore(10f);
            bookingTable.setSpacingAfter(10f);

            bookingTable.addCell(getCell("Ticket Number:", headerFont));
            bookingTable.addCell(getCell(String.valueOf(ticket.getTicketId()), regularFont));
            bookingTable.addCell(getCell("Booking Date:", headerFont));
            bookingTable.addCell(getCell(String.valueOf(booking.getBooking_date()), regularFont));

            document.add(new Paragraph("Booking Information", headerFont));
            document.add(bookingTable);

            // Passenger Info Table
            PdfPTable passengerTable = new PdfPTable(2);
            passengerTable.setWidthPercentage(100);
            passengerTable.setSpacingBefore(10f);
            passengerTable.setSpacingAfter(10f);

            passengerTable.addCell(getCell("Passenger Name:", headerFont));
            passengerTable.addCell(getCell(booking.getUser().getUserName(), regularFont));
            passengerTable.addCell(getCell("Passengers:", headerFont));
            passengerTable.addCell(getCell(String.valueOf(booking.getPassengers()), regularFont));

            document.add(new Paragraph("Passenger Information", headerFont));
            document.add(passengerTable);

            // Trip Info Table
            PdfPTable tripTable = new PdfPTable(2);
            tripTable.setWidthPercentage(100);
            tripTable.setSpacingBefore(10f);
            tripTable.setSpacingAfter(10f);

            tripTable.addCell(getCell("Route:", headerFont));
            tripTable.addCell(getCell(trip.getOrigin() + " to " + trip.getDestination(), regularFont));
            tripTable.addCell(getCell("Date:", headerFont));
            tripTable.addCell(getCell(String.valueOf(trip.getDate()), regularFont));
            tripTable.addCell(getCell("Duration:", headerFont));
            tripTable.addCell(getCell(""+trip.getDuration()+"", regularFont));
            tripTable.addCell(getCell("Bus Model:", headerFont));
            tripTable.addCell(getCell(trip.getBus().getModel(), regularFont));

            document.add(new Paragraph("Trip Details", headerFont));
            document.add(tripTable);

            // Fare Info Table
            PdfPTable fareTable = new PdfPTable(2);
            fareTable.setWidthPercentage(100);
            fareTable.setSpacingBefore(10f);
            fareTable.setSpacingAfter(10f);

            fareTable.addCell(getCell("Total Amount:", headerFont));
            fareTable.addCell(getCell("$" + booking.getPrice(), regularFont));
            fareTable.addCell(getCell("Status:", headerFont));
            fareTable.addCell(getCell(booking.getStatus(), regularFont));

            document.add(new Paragraph("Fare Details", headerFont));
            document.add(fareTable);

            // Close Document and Ticket
            document.close();
            ticket.setPdfFile(outputStream.toByteArray());
            ticketRepository.save(ticket);

        } catch (DocumentException | IOException e) {
            logger.error("Error generating ticket PDF", e);
        }

        return ticket;
    }

    private PdfPCell getCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
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