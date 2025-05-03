package com.swift.SwiftBus.Repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.swift.SwiftBus.Model.SearchTrip;
import com.swift.SwiftBus.Model.Trip;

public interface TripRepository extends JpaRepository<Trip, Integer> {

    // Find all trips matching origin and destination
    @Query("SELECT t FROM Trip t WHERE t.origin = :origin AND t.destination = :destination AND t.date = :date AND t.availableSeats >= :passengers AND t.status = true")
List<Trip> findAvailableTrips(String origin, String destination, Date date, int passengers);


    // Find all active trips (where status = true)
    List<Trip> findByStatusTrue();


    @Query("SELECT t FROM Trip t WHERE " +
    "(t.origin LIKE %:origin%) AND " +
    "(t.destination LIKE %:destination%) AND " +
    "(t.date = :date) AND " +
    "t.availableSeats >= :passengers AND " +
    "t.status = true")
List<Trip> searchTrip(
     @Param("origin") String origin,
     @Param("destination") String destination,
     @Param("date") Date date,
     @Param("passengers") int passengers);

     @Query("SELECT DISTINCT t.origin FROM Trip t WHERE t.status = true")
List<String> findDistinctOrigins();

@Query("SELECT DISTINCT t.destination FROM Trip t WHERE t.status = true")
List<String> findDistinctDestinations();

}
    

