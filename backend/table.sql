# GlobeTrotter_Odoo-Hackathon
CREATE DATABASE IF NOT EXISTS globetrotter_db;
USE globetrotter_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500) NULL,
  language VARCHAR(50) DEFAULT 'English',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  country VARCHAR(120) NOT NULL,
  region VARCHAR(120) NULL,
  cost_index DECIMAL(5,2) DEFAULT 1.00,
  popularity INT DEFAULT 0,
  image_url VARCHAR(500) NULL
);

CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  activity_type VARCHAR(80),
  cost DECIMAL(10,2) DEFAULT 0,
  duration_minutes INT DEFAULT 60,
  image_url VARCHAR(500) NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(180) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  cover_photo_url VARCHAR(500) NULL,
  share_token VARCHAR(80) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trip_stops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  city_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stop_order INT DEFAULT 1,
  transport_cost DECIMAL(10,2) DEFAULT 0,                                
  stay_cost DECIMAL(10,2) DEFAULT 0,
  meals_cost DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT
);

CREATE TABLE stop_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stop_id INT NOT NULL,
  activity_id INT NOT NULL,
  activity_date DATE NULL,
  activity_time TIME NULL,
  custom_cost DECIMAL(10,2) NULL,
  FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_stops_trip ON trip_stops(trip_id);
CREATE INDEX idx_activities_city ON activities(city_id);