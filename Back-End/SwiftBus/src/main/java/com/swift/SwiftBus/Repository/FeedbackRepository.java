package com.swift.SwiftBus.Repository;

import com.swift.SwiftBus.Model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    
}