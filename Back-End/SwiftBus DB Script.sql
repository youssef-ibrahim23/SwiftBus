-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('TRAVELER', 'DRIVER', 'ADMIN')),
    dtype VARCHAR(31) DEFAULT 'USER'
);

-- BUSES TABLE
CREATE TABLE buses (
    bus_id SERIAL PRIMARY KEY,
    model VARCHAR(50) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    assigned_driver INT REFERENCES users(user_id)
);

-- TRIPS TABLE
CREATE TABLE trips (
    trip_id SERIAL PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    duration INT NOT NULL CHECK (duration > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    total_seats INT NOT NULL CHECK (total_seats > 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    status BOOLEAN DEFAULT TRUE,
    bus_id INT REFERENCES buses(bus_id),
    driver_id INT REFERENCES users(user_id)
);

-- BOOKINGS TABLE
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    trip_id INT REFERENCES trips(trip_id),
    status VARCHAR(20) CHECK (status IN ('APPROVED', 'REJECT', 'PENDING')),
	passengers int REFERENCES USERS(USER_ID),
	total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
	booking_date DATE DEFAULT CURRENT_TIMESTAMP
);

-- TICKETS TABLE
CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    trip_id INT REFERENCES trips(trip_id),
    booking_id INT REFERENCES bookings(booking_id),
    pdf_file_bytea BYTEA
);

-- FEEDBACK TABLE
CREATE TABLE feedbacks (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    trip_id INT REFERENCES trips(trip_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(1000)
);

-- USERS
INSERT INTO users (user_name, email, password, role, dtype) VALUES
('Alice Admin', 'alice@swiftbus.com', 'hashed_password1', 'ADMIN', 'ADMIN'),
('Bob Driver', 'bob@swiftbus.com', 'hashed_password2', 'DRIVER', 'DRIVER'),
('Charlie Driver', 'charlie@swiftbus.com', 'hashed_password3', 'DRIVER', 'DRIVER'),
('Tina Traveler', 'tina@swiftbus.com', 'hashed_password4', 'TRAVELER', 'TRAVELER'),
('Tom Traveler', 'tom@swiftbus.com', 'hashed_password5', 'TRAVELER', 'TRAVELER');

-- BUSES
INSERT INTO buses (model, capacity, assigned_driver) VALUES
('Volvo 9700', 50, 2),  -- Bob Driver
('Mercedes Tourismo', 45, 3); -- Charlie Driver


-- TRIPS
INSERT INTO trips (origin, destination, date, duration, price, total_seats, available_seats, bus_id, driver_id) VALUES
('New York', 'Washington DC', '2025-05-10', 5, 29.99, 50, 48, 1, 2),
('Los Angeles', 'San Francisco', '2025-05-12', 7, 39.99, 45, 43, 2, 3);


-- BOOKINGS
INSERT INTO bookings (user_id, trip_id, status, passengers, total_price) VALUES
(4, 1, 'APPROVED', 2, 59.98),  -- Tina Traveler, 2 seats
(5, 2, 'PENDING', 1, 39.99);   -- Tom Traveler, 1 seat


-- FEEDBACKS
INSERT INTO feedbacks (user_id, trip_id, rating, comment) VALUES
(4, 1, 5, 'Great ride, very comfortable and punctual!'),
(5, 2, 4, 'Good trip, but the AC was a bit weak.');







