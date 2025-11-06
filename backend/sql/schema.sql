CREATE DATABASE IF NOT EXISTS uptime_monitor;
USE uptime_monitor;

-- websites table
CREATE TABLE IF NOT EXISTS websites (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  expectedStatus INT DEFAULT 200,
  timeoutMs INT DEFAULT 5000,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id VARCHAR(36) PRIMARY KEY,
  websiteId VARCHAR(36) NOT NULL,
  type ENUM('downtime','slow_response','other') NOT NULL,
  statusCode INT NULL,
  errorMessage TEXT NULL,
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolvedAt DATETIME NULL,
  isResolved BOOLEAN DEFAULT FALSE,
  durationSeconds INT NULL,
  FOREIGN KEY (websiteId) REFERENCES websites(id) ON DELETE CASCADE
);

-- metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id VARCHAR(36) PRIMARY KEY,
  websiteId VARCHAR(36) NOT NULL,
  responseTimeMs INT NOT NULL,
  statusCode INT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (websiteId) REFERENCES websites(id) ON DELETE CASCADE
);

-- notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
  id VARCHAR(36) PRIMARY KEY,
  websiteId VARCHAR(36) NOT NULL,
  email VARCHAR(255),
  smsNumber VARCHAR(50),
  notifyOn ENUM('downtime','slow_response','both','never') DEFAULT 'both',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (websiteId) REFERENCES websites(id) ON DELETE CASCADE
);
