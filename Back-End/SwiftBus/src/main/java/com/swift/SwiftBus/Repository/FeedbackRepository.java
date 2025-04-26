package com.swift.SwiftBus.Repository;

import com.swift.SwiftBus.Model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    List<Feedback> findByTripId(int tripId);
    List<Feedback> findByUserId(int userId);
}