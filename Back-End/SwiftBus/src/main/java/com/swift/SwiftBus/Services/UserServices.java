package com.swift.SwiftBus.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.swift.SwiftBus.Model.User;
import com.swift.SwiftBus.Repository.UserRepository;

@Service
public class UserServices {
    
    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(UserServices.class);

    public User register(User user) {
        try {
            // Check if email is already registered
            if (userRepository.findByEmail(user.getEmail()) != null) {
                throw new IllegalArgumentException("Email already registered!");
            }
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            logger.error("Error during registration: {}", e.getMessage());
            throw e;  // Re-throw the exception to be handled by the caller
        } catch (DataAccessException e) {
            logger.error("Database error during registration: {}", e.getMessage());
            throw new RuntimeException("Database error occurred while registering user.", e);
        }
    }

    public User login(String email, String password) {
        try {
            User user = userRepository.findByEmailAndPassword(email, password);
            if (user == null) {
                logger.warn("Login failed for email: {}", email);
            }
            return user;
        } catch (DataAccessException e) {
            logger.error("Database error during login attempt: {}", e.getMessage());
            throw new RuntimeException("Database error occurred while logging in.", e);
        }
    }

    public User getUserById(int id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (!user.isPresent()) {
                logger.warn("No user found with ID: {}", id);
                return null;
            }
            return user.get();
        } catch (DataAccessException e) {
            logger.error("Database error while fetching user by ID: {}", e.getMessage());
            throw new RuntimeException("Database error occurred while fetching user by ID.", e);
        }
    }

    public List<User> getAllUsers() {
        try {
            return userRepository.findAll();
        } catch (DataAccessException e) {
            logger.error("Database error while fetching all users: {}", e.getMessage());
            throw new RuntimeException("Database error occurred while fetching all users.", e);
        }
    }

    public boolean resetPassword(String email, String newPassword) {
        try {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                user.setPassword(newPassword);
                userRepository.save(user);
                return true;
            }
            logger.warn("No user found with email: {}", email);
            return false;
        } catch (DataAccessException e) {
            logger.error("Database error during password reset: {}", e.getMessage());
            throw new RuntimeException("Database error occurred while resetting password.", e);
        }
    }
}
