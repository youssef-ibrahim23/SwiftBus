package com.swift.SwiftBus.Model;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

public class SearchTrip {
    private String origin;
    private String destination;
     @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date date;
    private int passengers;

    // No-arg constructor
    public SearchTrip() {
    }

    // Constructor with fields
    public SearchTrip(String origin, String destination, Date date, int passengers) {
        this.origin = origin;
        this.destination = destination;
        this.date = date;
        this.passengers = passengers;
    }

    // Getters and setters
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

    public int getPassengers() {
        return passengers;
    }

    public void setPassengers(int passengers) {
        this.passengers = passengers;
    }
}