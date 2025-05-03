package com.swift.SwiftBus.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private int ticketId;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    
    @Column(name = "pdf_file_bytea", columnDefinition = "bytea")
    private byte[] pdfFileBytea;  // For actual file content

    @ManyToOne
    @JoinColumn(name = "user_id" , referencedColumnName = "user_id")
    private User user;

    // Constructors
    public Ticket() {
    }

    public Ticket(Trip trip, Booking booking, byte[] pdfFile) {
        this.trip = trip;
        this.booking = booking;
        this.pdfFileBytea = pdfFile;
    }

    // Getters and Setters
    public int getTicketId() {
        return ticketId;
    }

    public void setTicketId(int ticketId) {
        this.ticketId = ticketId;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public Booking getBooking() {
        return booking;
    }

    public void setBooking(Booking booking) {
        this.booking = booking;
    }

    public byte[] getPdfFile() {
        return pdfFileBytea;
    }

    public void setPdfFile(byte[] pdfFile) {
        this.pdfFileBytea = pdfFile;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    
}
