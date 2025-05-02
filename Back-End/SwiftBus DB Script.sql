-- USERS TABLE
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(10) CHECK (role IN ('TRAVELER', 'DRIVER', 'ADMIN'))
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
	passengers NUMBER REFERENCES USERS(USER_ID),
	total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
	booking_date DATE DEFAULT CURRENT_TIMESTAMP,
    bus_id INT REFERENCES buses(bus_id),
);

-- TICKETS TABLE
CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    trip_id INT REFERENCES trips(trip_id),
    booking_id INT REFERENCES bookings(booking_id),
    pdf_file BYTEA
);

-- FEEDBACK TABLE
CREATE TABLE feedbacks (
    feedback_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    trip_id INT REFERENCES trips(trip_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(1000)
);
