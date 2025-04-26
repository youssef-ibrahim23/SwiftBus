package com.swift.SwiftBus.Repository;

import com.swift.SwiftBus.Model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByUserId(int userId);
    List<Booking> findByTripId(int tripId);
}
