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
        boolean result = updateBookingStatus(id, "REJECT");
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
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 22, Font.BOLD, BaseColor.DARK_GRAY);
            Font sectionFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, BaseColor.BLACK);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Font regularFont = new Font(Font.FontFamily.HELVETICA, 12);
    
            // Title
            Paragraph title = new Paragraph("SWIFTBUS E-TICKET", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10f);
            document.add(title);
    
            LineSeparator separator = new LineSeparator();
            separator.setOffset(-2);
            document.add(new Chunk(separator));
            document.add(Chunk.NEWLINE);
    
            // Section: Booking Info
            document.add(new Paragraph("Booking Information", sectionFont));
            document.add(Chunk.NEWLINE);
            PdfPTable bookingTable = new PdfPTable(2);
            bookingTable.setWidthPercentage(100);
            bookingTable.addCell(getStyledCell("Ticket Number:", headerFont));
            bookingTable.addCell(getStyledCell(String.valueOf(ticket.getTicketId()), regularFont));
            bookingTable.addCell(getStyledCell("Booking Date:", headerFont));
            bookingTable.addCell(getStyledCell(String.valueOf(booking.getBooking_date()), regularFont));
            document.add(bookingTable);
            document.add(Chunk.NEWLINE);
    
            // Section: Passenger Info
            document.add(new Paragraph("Passenger Information", sectionFont));
            document.add(Chunk.NEWLINE);
            PdfPTable passengerTable = new PdfPTable(2);
            passengerTable.setWidthPercentage(100);
            passengerTable.addCell(getStyledCell("User Name:", headerFont));
            passengerTable.addCell(getStyledCell(user.getUserName(), regularFont));
            passengerTable.addCell(getStyledCell("Passengers:", headerFont));
            passengerTable.addCell(getStyledCell(String.valueOf(booking.getPassengers()), regularFont));
            document.add(passengerTable);
            document.add(Chunk.NEWLINE);
    
            // Section: Trip Info
            document.add(new Paragraph("Trip Details", sectionFont));
            document.add(Chunk.NEWLINE);
            PdfPTable tripTable = new PdfPTable(2);
            tripTable.setWidthPercentage(100);
            tripTable.addCell(getStyledCell("Trip Id:", headerFont));
            tripTable.addCell(getStyledCell("" + trip.getTripId() + "", regularFont));
            tripTable.addCell(getStyledCell("Route:", headerFont));
            tripTable.addCell(getStyledCell(trip.getOrigin() + " to " + trip.getDestination(), regularFont));
            tripTable.addCell(getStyledCell("Date:", headerFont));
            tripTable.addCell(getStyledCell(String.valueOf(trip.getDate()), regularFont));
            tripTable.addCell(getStyledCell("Duration:", headerFont));
            tripTable.addCell(getStyledCell(trip.getDuration() + " hrs", regularFont));
            tripTable.addCell(getStyledCell("Bus Model:", headerFont));
            tripTable.addCell(getStyledCell(trip.getBus().getModel(), regularFont));
            document.add(tripTable);
            document.add(Chunk.NEWLINE);
    
            // Section: Fare Info
            document.add(new Paragraph("Fare Details", sectionFont));
            document.add(Chunk.NEWLINE);
            PdfPTable fareTable = new PdfPTable(2);
            fareTable.setWidthPercentage(100);
            fareTable.addCell(getStyledCell("Total Amount:", headerFont));
            fareTable.addCell(getStyledCell("$" + booking.getPrice(), regularFont));
            fareTable.addCell(getStyledCell("Status:", headerFont));
            fareTable.addCell(getStyledCell(booking.getStatus(), regularFont));
            document.add(fareTable);
            document.add(Chunk.NEWLINE);
    
            // Footer Note
            Paragraph footer = new Paragraph("Thank you for choosing SwiftBus.\nFor support, contact us at support@swiftbus.com", new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, BaseColor.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(20f);
            document.add(footer);
    
            document.close();
            ticket.setPdfFile(outputStream.toByteArray());
            ticketRepository.save(ticket);
    
        } catch (DocumentException | IOException e) {
            logger.error("Error generating ticket PDF", e);
        }
    
        return ticket;
    }
    // Utility: Create styled cell
    PdfPCell getStyledCell(String content, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(8f);
        cell.setBorderColor(BaseColor.LIGHT_GRAY);
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

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }
}