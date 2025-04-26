package com.swift.SwiftBus.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "bus")
public class Bus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int busId;

    @Column(nullable = false)
    private String busModel;

    @Column(nullable = false)
    private int capacity;

    @OneToOne
    @JoinColumn(name = "driver_id", referencedColumnName = "id")
    private Driver driver;

    // Constructors
    public Bus() {}

    public Bus(String busModel, int capacity, Driver driver) {
        this.busModel = busModel;
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

    public String getBusModel() {
        return busModel;
    }

    public void setBusModel(String busModel) {
        this.busModel = busModel;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }
}
