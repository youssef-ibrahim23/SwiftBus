package com.swift.SwiftBus.Repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.swift.SwiftBus.Model.Trip;

public interface TripRepository extends JpaRepository<Trip, Integer> {

    // Find all trips matching origin and destination
    @Query("SELECT t FROM Trip t WHERE t.origin = :origin AND t.destination = :destination AND t.date = :date AND t.availableSeats >= :passengers AND t.status = true")
List<Trip> findAvailableTrips(String origin, String destination, Date date, int passengers);


    // Find all active trips (where status = true)
    List<Trip> findByStatusTrue();

    // Custom update query
    @Modifying
    @Transactional
    @Query("UPDATE Trip t SET " +
           "t.origin = :origin, " +
           "t.destination = :destination, " +
           "t.date = :date, " +
           "t.duration = :duration, " +
           "t.price = :price, " +
           "t.totalSeats = :totalSeats, " +
           "t.status = :status, " +
           "t.bus.id = :busId, " +
           "t.driver.id = :driverId " +
           "WHERE t.id = :id")
    int updateTrip(int id, String origin, String destination, Date date,
                   int duration, Double price, Integer totalSeats, Boolean status,
                   int busId, int driverId);
}
