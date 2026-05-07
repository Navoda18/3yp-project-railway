// IRSensorDataDTO.java
package com.dto.sensor;

public class IRSensorDataDTO {

    private String sensorId;
    private String timestamp;
    private String deviceId;
    private boolean crackDetected;
    private String status;
    private double severity;
    private String imageUrl;
    private LocationDTO location;

    // Empty constructor needed by Spring
    public IRSensorDataDTO() {
    }

    // Constructor to quickly build the object
    public IRSensorDataDTO(String sensorId, String timestamp, String deviceId, boolean crackDetected, String status) {
        this.sensorId = sensorId;
        this.timestamp = timestamp;
        this.deviceId = deviceId;
        this.crackDetected = crackDetected;
        this.status = status;
    }

    public IRSensorDataDTO(String sensorId, String timestamp, String deviceId, boolean crackDetected, String status,
            LocationDTO location) {
        this.sensorId = sensorId;
        this.timestamp = timestamp;
        this.deviceId = deviceId;
        this.crackDetected = crackDetected;
        this.status = status;
        this.location = location;
    }

    public IRSensorDataDTO(String sensorId, String timestamp, String deviceId, boolean crackDetected, String status,
            double severity, LocationDTO location) {
        this.sensorId = sensorId;
        this.timestamp = timestamp;
        this.deviceId = deviceId;
        this.crackDetected = crackDetected;
        this.status = status;
        this.severity = severity;
        this.location = location;
    }

    // Standard Getters and Setters
    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public boolean isCrackDetected() {
        return crackDetected;
    }

    public void setCrackDetected(boolean crackDetected) {
        this.crackDetected = crackDetected;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getSeverity() {
        return severity;
    }

    public void setSeverity(double severity) {
        this.severity = severity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocationDTO getLocation() {
        return location;
    }

    public void setLocation(LocationDTO location) {
        this.location = location;
    }
}

// The DTO is a clean, lightweight, plain Java object with zero database logic.
// The Mapper takes the heavy DB Entity, copies only the safe data into the DTO,
// and ships the DTO to the frontend.