package com.swift.SwiftBus.Model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "trip")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String origin;
    private String destination;

    @Temporal(TemporalType.DATE)
    private Date date;

    private String duration;  // fixed spelling
    private double price;
    private int availableSeats;
    private boolean status;

    @ManyToOne
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    // Constructors
    public Trip() {}

    public Trip(String origin, String destination, Date date, String duration, double price,
                int availableSeats, boolean status, Bus bus, Driver driver) {
        this.origin = origin;
        this.destination = destination;
        this.date = date;
        this.duration = duration;
        this.price = price;
        this.availableSeats = availableSeats;
        this.status = status;
        this.bus = bus;
        this.driver = driver;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getOrigin() {
        return origin;
    }

    public void setOrigin(String origin) {
        this.origin = origin;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public Bus getBus() {
        return bus;
    }

    public void setBus(Bus bus) {
        this.bus = bus;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }
}
