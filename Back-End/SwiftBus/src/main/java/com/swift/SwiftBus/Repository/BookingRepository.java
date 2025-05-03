package com.swift.SwiftBus.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.swift.SwiftBus.Model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    List<Booking> findByUser_UserId(int userId);

    int countByStatus(String status);

    // Custom method to find bookings by status (e.g., "PENDING", "APPROVED", "REJECTED")
    List<Booking> findByStatus(String status);
    
 }
