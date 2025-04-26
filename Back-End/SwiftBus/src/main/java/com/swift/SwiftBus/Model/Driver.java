package com.swift.SwiftBus.Model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Driver extends User {

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL)
    private List<Trip> assignedTrips;

    // Constructors
    public Driver() {}

    public Driver(String name, String email, String password, String role) {
        super(name, email, password, role);
     
    }

    // Getters and Setters
    public List<Trip> getAssignedTrips() {
        return assignedTrips;
    }

    public void setAssignedTrips(List<Trip> assignedTrips) {
        this.assignedTrips = assignedTrips;
    }

}
