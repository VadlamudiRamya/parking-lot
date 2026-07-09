-- Parking Lot System — MySQL Schema
-- Run this file after creating your database:
--   CREATE DATABASE parking_db;
--   USE parking_db;
--   SOURCE schema.sql;

CREATE TABLE IF NOT EXISTS tickets (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id      VARCHAR(20) UNIQUE NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  vehicle_type   ENUM('bike','car','truck') NOT NULL,
  entry_time     DATETIME NOT NULL,
  exit_time      DATETIME DEFAULT NULL,
  amount         DECIMAL(6,2) DEFAULT NULL,
  status         ENUM('parked','exited') NOT NULL DEFAULT 'parked'
);
