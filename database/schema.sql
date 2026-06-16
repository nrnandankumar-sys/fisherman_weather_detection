-- Smart Fisherman Weather Detection System - Database Schema

CREATE DATABASE IF NOT EXISTS fisherman_db;
USE fisherman_db;

-- Drop existing tables
DROP TABLE IF EXISTS broadcast_messages;
DROP TABLE IF EXISTS emergency_sos;
DROP TABLE IF EXISTS gps_locations;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS weather_data;
DROP TABLE IF EXISTS fishermen;
DROP TABLE IF EXISTS locations;

-- Locations table
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fishermen table
CREATE TABLE fishermen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_phone (phone),
    INDEX idx_email (email)
);

-- Weather Data table
CREATE TABLE weather_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL,
    temperature FLOAT NOT NULL,
    humidity FLOAT,
    wind_speed FLOAT NOT NULL,
    wind_direction VARCHAR(10),
    rainfall FLOAT,
    sea_condition VARCHAR(50),
    visibility FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    forecast_data JSON,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_location_timestamp (location_id, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- Alerts table
CREATE TABLE alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    location_id INT NOT NULL,
    message TEXT NOT NULL,
    is_broadcast BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_location_id (location_id),
    INDEX idx_severity (severity)
);

-- GPS Locations table
CREATE TABLE gps_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fisherman_id INT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed FLOAT,
    direction FLOAT,
    altitude FLOAT,
    accuracy FLOAT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fisherman_id) REFERENCES fishermen(id),
    INDEX idx_fisherman_timestamp (fisherman_id, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- Emergency SOS table
CREATE TABLE emergency_sos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fisherman_id INT NOT NULL,
    emergency_type VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    responder_id INT,
    FOREIGN KEY (fisherman_id) REFERENCES fishermen(id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_fisherman_id (fisherman_id)
);

-- Broadcast Messages table
CREATE TABLE broadcast_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    location_id INT,
    priority VARCHAR(20) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_count INT DEFAULT 0,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    INDEX idx_created_at (created_at),
    INDEX idx_message_type (message_type),
    INDEX idx_priority (priority)
);

-- Sample Data Insertion
INSERT INTO locations (name, latitude, longitude, region) VALUES
('Port A', 13.0833, 80.2803, 'Tamil Nadu'),
('Port B', 12.9716, 79.1578, 'Tamil Nadu'),
('Port C', 15.4909, 73.8278, 'Goa'),
('Port D', 18.5204, 73.8567, 'Maharashtra');

INSERT INTO fishermen (name, phone, email) VALUES
('Rajesh Kumar', '9876543210', 'rajesh@example.com'),
('Sanjay Singh', '9876543211', 'sanjay@example.com'),
('Amit Patel', '9876543212', 'amit@example.com'),
('Vikram Sharma', '9876543213', 'vikram@example.com');

INSERT INTO weather_data (location_id, temperature, humidity, wind_speed, wind_direction, rainfall, sea_condition, visibility) VALUES
(1, 28.5, 75, 15, 'NE', 2.5, 'moderate', 10),
(2, 29.2, 72, 18, 'E', 1.5, 'slight', 12),
(3, 27.8, 78, 20, 'SE', 3.0, 'rough', 8),
(4, 30.1, 70, 12, 'W', 0.5, 'calm', 15);

INSERT INTO alerts (alert_type, severity, location_id, message, is_broadcast, expires_at) VALUES
('strong_wind', 'high', 1, 'Strong winds expected in the region', TRUE, DATE_ADD(NOW(), INTERVAL 6 HOUR)),
('heavy_rain', 'medium', 2, 'Heavy rainfall warning issued', FALSE, DATE_ADD(NOW(), INTERVAL 12 HOUR)),
('unsafe_sea', 'critical', 3, 'Sea condition unsafe for fishing operations', TRUE, DATE_ADD(NOW(), INTERVAL 3 HOUR));

INSERT INTO gps_locations (fisherman_id, latitude, longitude, speed, direction, altitude, accuracy) VALUES
(1, 13.0833, 80.2803, 25, 45, 5, 10),
(2, 12.9716, 79.1578, 30, 90, 3, 15),
(3, 15.4909, 73.8278, 20, 180, 4, 12);

-- Create Views for common queries
CREATE VIEW active_alerts AS
SELECT * FROM alerts
WHERE status = 'active' AND (expires_at IS NULL OR expires_at > NOW());

CREATE VIEW broadcast_alerts AS
SELECT * FROM alerts
WHERE is_broadcast = TRUE AND status = 'active';

CREATE VIEW recent_sos_calls AS
SELECT * FROM emergency_sos
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;

-- Create Stored Procedures
DELIMITER //

CREATE PROCEDURE sp_expire_old_alerts()
BEGIN
    UPDATE alerts
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();
END//

CREATE PROCEDURE sp_get_alerts_by_location_and_severity(
    IN p_location_id INT,
    IN p_severity VARCHAR(20)
)
BEGIN
    SELECT * FROM alerts
    WHERE location_id = p_location_id
    AND severity = p_severity
    AND status = 'active'
    ORDER BY created_at DESC;
END//

DELIMITER ;

-- Create Indexes for better performance
CREATE INDEX idx_gps_recent ON gps_locations(fisherman_id, timestamp DESC);
CREATE INDEX idx_sos_active ON emergency_sos(status, created_at DESC);
CREATE INDEX idx_alerts_broadcast ON alerts(is_broadcast, status, created_at DESC);
