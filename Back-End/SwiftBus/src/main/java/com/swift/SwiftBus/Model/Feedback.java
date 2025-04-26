package com.swift.SwiftBus.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // Relationship with User
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Relationship with Trip
    @ManyToOne
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false)
    private int rating;

    @Column(length = 1000)
    private String comment;

    // Constructors
    public Feedback() {}

    public Feedback(User user, Trip trip, int rating, String comment) {
        this.user = user;
        this.trip = trip;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
