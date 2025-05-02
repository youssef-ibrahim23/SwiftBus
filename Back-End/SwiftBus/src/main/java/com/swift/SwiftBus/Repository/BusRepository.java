package com.swift.SwiftBus.Repository;

import com.swift.SwiftBus.Model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusRepository extends JpaRepository<Bus, Integer> {
    
}
