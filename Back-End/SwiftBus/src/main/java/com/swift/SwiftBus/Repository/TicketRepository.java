package com.swift.SwiftBus.Repository;

import com.swift.SwiftBus.Model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    Ticket findByBookingId(int bookingId);
}