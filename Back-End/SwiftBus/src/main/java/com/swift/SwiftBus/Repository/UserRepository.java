package com.swift.SwiftBus.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

import com.swift.SwiftBus.Model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    /**
     * Finds a user by email and password (for authentication)
     * @param email User's email
     * @param password User's password
     * @return Optional containing the user if found
     */
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.password = :password")
    Optional<User> findByEmailAndPassword(String email, String password);

    /**
     * Checks if a user exists with the given email
     * @param email Email to check
     * @return true if email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Finds a user by email
     * @param email User's email
     * @return Optional containing the user if found
     */
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmail(String email);
}