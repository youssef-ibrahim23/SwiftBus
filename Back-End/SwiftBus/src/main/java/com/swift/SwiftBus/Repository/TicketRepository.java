package com.swift.SwiftBus.Repository;


import java.util.List;
import java.util.Optional;

import com.swift.SwiftBus.Model.Ticket;

import org.springframework.data.jpa.repository.JpaRepository;


public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    Optional<Ticket> findByBookingId(int bookingId);

    List<Ticket> findByUser_UserId(int userId);

    List<Ticket> findByBookingId(Long bookingId);

}