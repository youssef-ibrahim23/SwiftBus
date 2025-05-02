package com.swift.SwiftBus.Model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class Driver extends User {

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL)
    private List<Trip> assignedTrips;

    // Constructors
    public Driver() {}

    // Automatically setting the role to "DRIVER" for Driver objects
    public Driver(String name, String email, String password) {
        super(name, email, password, Role.DRIVER);
    }

    // Getters and Setters
    public List<Trip> getAssignedTrips() {
        return assignedTrips;
    }

    public void setAssignedTrips(List<Trip> assignedTrips) {
        this.assignedTrips = assignedTrips;
    }
}
