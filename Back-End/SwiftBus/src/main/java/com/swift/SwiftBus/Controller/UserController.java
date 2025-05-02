package com.swift.SwiftBus.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.swift.SwiftBus.Model.User;
import com.swift.SwiftBus.Model.User.Role;
import com.swift.SwiftBus.Services.UserServices;
import com.swift.SwiftBus.Errors.AuthenticationException;
import com.swift.SwiftBus.Errors.EmailAlreadyExistsException;
import com.swift.SwiftBus.Errors.UserNotFoundException;
import com.swift.SwiftBus.Errors.UserRegistrationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*")  // Allow all origins (for development)
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserServices userService;

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    // Register User
    @PostMapping("/register")
public ResponseEntity<?> registerUser(@RequestBody User user) {
    try {
        // Set role to 'TRAVELER' if no role is provided, otherwise keep the provided role
        if (user.getRole() == null) {
            user.setRole(Role.TRAVELER);
        }

        // Register the user by calling the service method
        User registeredUser = userService.register(user);

        // Return the registered user with HTTP 201 Created status
        return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);

    } catch (EmailAlreadyExistsException e) {
        // Log warning if email already exists
        logger.warn("Email already exists during registration: {}", user.getEmail());

        // Return HTTP 409 Conflict response with an appropriate message
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Email already registered: " + user.getEmail());

    } catch (UserRegistrationException e) {
        // Log error in case of user registration failure
        logger.error("Error registering user {}: {}", user.getEmail(), e.getMessage());

        // Return HTTP 400 Bad Request with error details
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("User registration failed: " + e.getMessage());

    } catch (Exception e) {
        // Log unexpected error
        logger.error("Unexpected error during registration: {}", e.getMessage());

        // Return HTTP 500 Internal Server Error with generic error message
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred during registration");
    }
}

    // User Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            User loggedInUser = userService.login(user.getEmail(), user.getPassword());
            if (loggedInUser == null) {
                logger.warn("Login failed for email: {}", user.getEmail());
                return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED); // HTTP 401 Unauthorized
            }
            return new ResponseEntity<>(loggedInUser, HttpStatus.OK); // HTTP 200 OK
        } catch (AuthenticationException e) {
            logger.warn("Authentication failed for email: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication failed: " + e.getMessage()); // HTTP 401 Unauthorized
        } catch (Exception e) {
            logger.error("Unexpected error during login: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred during login"); // HTTP 500 Internal Server Error
        }
    }

    // Get User by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable int id) {
        try {
            User user = userService.getUserById(id);
            return new ResponseEntity<>(user, HttpStatus.OK); // HTTP 200 OK
        } catch (UserNotFoundException e) {
            logger.warn("No user found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found with ID: " + id); // HTTP 404 Not Found
        } catch (Exception e) {
            logger.error("Unexpected error fetching user {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while fetching user"); // HTTP 500 Internal Server Error
        }
    }

    // Get All Users
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            if (users.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                        .body("No users found."); // HTTP 204 No Content
            }
            return new ResponseEntity<>(users, HttpStatus.OK); // HTTP 200 OK
        } catch (Exception e) {
            logger.error("Error fetching users: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred while fetching users"); // HTTP 500 Internal Server Error
        }
    }

    // Reset User Password
    @PutMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> requestData) {
    String email = requestData.get("email");
    String newPassword = requestData.get("newPassword");

    // Log incoming data
    logger.info("Received reset password request for email: {}", email);

    if (email == null || newPassword == null) {
        logger.error("Email or new password is missing");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Email or new password is missing."); // HTTP 400 Bad Request
    }

    try {
        boolean resetSuccess = userService.resetPassword(email, newPassword);
        if (resetSuccess) {
            return new ResponseEntity<>("Password reset successfully.", HttpStatus.OK); // HTTP 200 OK
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found for password reset."); // HTTP 404 Not Found
        }
    } catch (UserNotFoundException e) {
        logger.warn("Password reset failed for email: {}", email);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("User not found for password reset: " + email); // HTTP 404 Not Found
    } catch (Exception e) {
        logger.error("Unexpected error during password reset: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred while resetting the password"); // HTTP 500 Internal Server Error
    }
}


}
