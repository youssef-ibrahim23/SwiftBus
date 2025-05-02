package com.swift.SwiftBus.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "buses")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bus_id")
    private int busId;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(nullable = false)
    private int capacity;

    // Make it nullable for now, depending on your use case, you might want to revisit this.
    @OneToOne
    @JoinColumn(name = "assigned_driver", referencedColumnName = "user_id", nullable = true)
    private User driver;

    // Constructors
    public Bus() {}

    public Bus(String model, int capacity, User driver) {
        this.model = model;
        this.capacity = capacity;
        this.driver = driver;
    }

    // Getters and Setters
    public int getBusId() {
        return busId;
    }

    public void setBusId(int busId) {
        this.busId = busId;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public User getDriver() {
        return this.driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }
}
