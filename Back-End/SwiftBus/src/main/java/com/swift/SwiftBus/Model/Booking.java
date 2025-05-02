package com.swift.SwiftBus.Model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private int bookingId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false , referencedColumnName = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false , referencedColumnName="trip_id")
    private Trip trip;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private Date bookingDate;

    @Column(nullable = false)
    private Double totalPrice;

    @Column(nullable = false)
    private int passengers;

    // Constructors
    public Booking() {
        this.bookingDate = new Date();  // Initialize booking_date to the current timestamp by default
    }

    public Booking(User user, Trip trip, String status, double price, int passengers) {
        this.user = user;
        this.trip = trip;
        this.status = status;
        this.totalPrice = price;
        this.passengers = passengers;
        this.bookingDate = new Date();
    }
    

    // Getters and Setters
    public int getId() {
        return bookingId;
    }

    public void setId(int id) {
        this.bookingId = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getPrice() {
        return totalPrice;
    }

    public void setPrice(Double price) {
        this.totalPrice = price;
    }

    public int getPassengers() {
        return passengers;
    }

    public void setPassengers(int passengers) {
        this.passengers = passengers;
    }

    public Date getBooking_date() {
        return bookingDate;
    }

    public void setBooking_date(Date booking_date) {
        this.bookingDate = booking_date;
    }

}
