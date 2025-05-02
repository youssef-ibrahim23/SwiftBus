package com.swift.SwiftBus.Services;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.swift.SwiftBus.Errors.AuthenticationException;
import com.swift.SwiftBus.Errors.EmailAlreadyExistsException;
import com.swift.SwiftBus.Errors.UserNotFoundException;
import com.swift.SwiftBus.Errors.UserRegistrationException;
import com.swift.SwiftBus.Errors.UserServiceException;
import com.swift.SwiftBus.Model.User;
import com.swift.SwiftBus.Repository.UserRepository;

@Service
public class UserServices {
    
    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(UserServices.class);

    /**
     * Registers a new user
     * @param user User object to register
     * @return Registered user
     * @throws EmailAlreadyExistsException if email is already registered
     * @throws UserRegistrationException if registration fails
     */
    public User register(User user) {
        try {
            // Validate input
            if (user == null) {
                throw new IllegalArgumentException("User object cannot be null");
            }
            
            // Check if email is already registered
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new EmailAlreadyExistsException("Email already registered: " + user.getEmail());
            }
            
            return userRepository.save(user);
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error during registration: {}", e.getMessage());
            throw new UserRegistrationException("Invalid user data: " + e.getMessage(), e);
        } catch (DataIntegrityViolationException e) {
            logger.error("Data integrity violation during registration: {}", e.getMessage());
            throw new UserRegistrationException("Data integrity violation while registering user", e);
        } catch (DataAccessException e) {
            logger.error("Database error during registration: {}", e.getMessage());
            throw new UserRegistrationException("Database error occurred while registering user", e);
        } catch (EmailAlreadyExistsException e) {
            logger.error("Unexpected error during registration: {}", e.getMessage());
            throw new UserRegistrationException("An unexpected error occurred during registration", e);
        }
    }

    /**
     * Authenticates a user
     * @param email User's email
     * @param password User's password
     * @return Authenticated user if successful
     * @throws AuthenticationException if authentication fails
     * @throws UserServiceException if service error occurs
     */
    public User login(String email, String password) {
        try {
            // Validate input
            if (email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be empty");
            }
            if (password == null || password.trim().isEmpty()) {
                throw new IllegalArgumentException("Password cannot be empty");
            }
            
            Optional<User> user = userRepository.findByEmailAndPassword(email, password);
            if (user == null) {
                logger.warn("Login failed for email: {}", email);
                throw new AuthenticationException("Invalid email or password");
            }
            return user.get();
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error during login: {}", e.getMessage());
            throw new AuthenticationException("Invalid login credentials: " + e.getMessage(), e);
        } catch (DataAccessException e) {
            logger.error("Database error during login attempt: {}", e.getMessage());
            throw new UserServiceException("Database error occurred while logging in", e);
        } catch (AuthenticationException e) {
            logger.error("Unexpected error during login: {}", e.getMessage());
            throw new UserServiceException("An unexpected error occurred during login", e);
        }
    }

    /**
     * Retrieves a user by ID
     * @param id User ID
     * @return User if found
     * @throws UserNotFoundException if user not found
     * @throws UserServiceException if service error occurs
     */
    public User getUserById(int id) {
        try {
            Optional<User> user = userRepository.findById(id);
            return user.orElseThrow(() -> {
                logger.warn("No user found with ID: {}", id);
                return new UserNotFoundException("User not found with ID: " + id);
            });
            
        } catch (DataAccessException e) {
            logger.error("Database error while fetching user by ID: {}", e.getMessage());
            throw new UserServiceException("Database error occurred while fetching user by ID", e);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching user by ID: {}", e.getMessage());
            throw new UserServiceException("An unexpected error occurred while fetching user by ID", e);
        }
    }

    /**
     * Retrieves all users
     * @return List of all users
     * @throws UserServiceException if service error occurs
     */
    public List<User> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                logger.info("No users found in database");
            }
            return users;
            
        } catch (DataAccessException e) {
            logger.error("Database error while fetching all users: {}", e.getMessage());
            throw new UserServiceException("Database error occurred while fetching all users", e);
        } catch (Exception e) {
            logger.error("Unexpected error while fetching all users: {}", e.getMessage());
            throw new UserServiceException("An unexpected error occurred while fetching all users", e);
        }
    }

    /**
     * Resets a user's password
     * @param email User's email
     * @param newPassword New password
     * @return true if successful
     * @throws UserNotFoundException if user not found
     * @throws UserServiceException if service error occurs
     */
    public boolean resetPassword(String email, String newPassword) {
        try {
            // Validate input
            if (email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be empty");
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                throw new IllegalArgumentException("New password cannot be empty");
            }
            
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("No user found with email: {}", email);
                    return new UserNotFoundException("User not found with email: " + email);
                });
            
            user.setPassword(newPassword);
            userRepository.save(user);
            return true;
            
        } catch (IllegalArgumentException e) {
            logger.error("Validation error during password reset: {}", e.getMessage());
            throw new UserServiceException("Invalid password reset data: " + e.getMessage(), e);
        } catch (DataAccessException e) {
            logger.error("Database error during password reset: {}", e.getMessage());
            throw new UserServiceException("Database error occurred while resetting password", e);
        } catch (Exception e) {
            logger.error("Unexpected error during password reset: {}", e.getMessage());
            throw new UserServiceException("An unexpected error occurred while resetting password", e);
        }
    }
}