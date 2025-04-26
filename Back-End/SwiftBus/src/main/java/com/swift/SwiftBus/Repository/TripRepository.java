package com.swift.SwiftBus.Repository;

import com.swift.SwiftBus.Model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByOriginAndDestination(String origin, String destination);
}
