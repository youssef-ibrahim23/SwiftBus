package com.swift.SwiftBus.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.swift.SwiftBus.Model.User;
import com.swift.SwiftBus.Services.UserServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@CrossOrigin(origins = "*")  // Allow all origins (for development)
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserServices userService;

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        try {
            user.setRole("TRAVELER");
            User registeredUser = userService.register(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED); // Return HTTP 201 Created
        } catch (IllegalArgumentException e) {
            logger.error("Registration failed: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // Return HTTP 400 Bad Request
        }
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        try {
            User loggedInUser = userService.login(user.getEmail(), user.getPassword());
            if (loggedInUser == null) {
                logger.warn("Login failed for email: {}", user.getEmail());
                return new ResponseEntity<>(null, HttpStatus.UNAUTHORIZED); // Return HTTP 401 Unauthorized
            }
            return new ResponseEntity<>(loggedInUser, HttpStatus.OK); // Return HTTP 200 OK
        } catch (Exception e) {
            logger.error("Login error: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR); // Return HTTP 500 Internal Server Error
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable int id) {
        User user = userService.getUserById(id);
        if (user == null) {
            logger.warn("No user found with ID: {}", id);
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND); // Return HTTP 404 Not Found
        }
        return new ResponseEntity<>(user, HttpStatus.OK); // Return HTTP 200 OK
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK); // Return HTTP 200 OK
    }

    @PutMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam(required = false) String email, @RequestParam(required = false) String newPassword) {
        if (email == null || newPassword == null) {
            logger.error("Email or new password is missing");
            return new ResponseEntity<>("Email or new password is missing.", HttpStatus.BAD_REQUEST); // Return HTTP 400 Bad Request
        }
        boolean resetSuccess = userService.resetPassword(email, newPassword);
        if (resetSuccess) {
            return new ResponseEntity<>("Password reset successfully.", HttpStatus.OK); // Return HTTP 200 OK
        } else {
            logger.warn("Password reset failed for email: {}", email);
            return new ResponseEntity<>("Password reset failed.", HttpStatus.NOT_FOUND); // Return HTTP 404 Not Found
        }
    }
}
