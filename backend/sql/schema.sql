CREATE DATABASE IF NOT EXISTS uptime_monitor;
USE uptime_monitor;

-- users table
CREATE TABLE IF NOT EXISTS users (
  user_email VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- websites table (scoped to user via user_email)
CREATE TABLE IF NOT EXISTS websites (
  id VARCHAR(36) PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  expectedStatus INT DEFAULT 200,
  timeoutMs INT DEFAULT 5000,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_email) REFERENCES users(user_email) ON DELETE CASCADE
);

-- incidents table
-- type ENUM expanded to cover all cases monitoringService.js uses
CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(36) PRIMARY KEY,
  websiteId VARCHAR(36) NOT NULL,
  type ENUM('downtime', 'slow_response', 'http_error', 'connection_error', 'other') NOT NULL,
  statusCode INT NULL,
  errorMessage TEXT NULL,
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolvedAt DATETIME NULL,
  isResolved BOOLEAN DEFAULT FALSE,
  durationSeconds INT NULL,
  FOREIGN KEY (websiteId) REFERENCES websites(id) ON DELETE CASCADE
);

-- metrics table
-- location column added (monitoringService saves location name per check)
CREATE TABLE IF NOT EXISTS metrics (
  id VARCHAR(36) PRIMARY KEY,
  websiteId VARCHAR(36) NOT NULL,
  responseTimeMs INT NOT NULL,
  statusCode INT NULL,
  location VARCHAR(100) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (websiteId) REFERENCES websites(id) ON DELETE CASCADE
);

-- notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id VARCHAR(36) PRIMARY KEY,
  websiteId VARCHAR(36) NOT NULL,
  email VARCHAR(255),
  smsNumber VARCHAR(50),
  notifyOn ENUM('downtime', 'slow_response', 'both', 'never') DEFAULT 'both',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (websiteId) REFERENCES websites(id) ON DELETE CASCADE
);

-- website_locations table
CREATE TABLE IF NOT EXISTS website_locations (
  id VARCHAR(36) PRIMARY KEY,
  websiteId VARCHAR(36) NOT NULL,
  locationId VARCHAR(50) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (websiteId) REFERENCES websites(id) ON DELETE CASCADE
);