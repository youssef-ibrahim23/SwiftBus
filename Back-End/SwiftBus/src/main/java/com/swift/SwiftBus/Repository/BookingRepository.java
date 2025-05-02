package com.swift.SwiftBus.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.swift.SwiftBus.Model.Booking;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    List<Booking> findByUser_UserId(int userId);
    
 }
