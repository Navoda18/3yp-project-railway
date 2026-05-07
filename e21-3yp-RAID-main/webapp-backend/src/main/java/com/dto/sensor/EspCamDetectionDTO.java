// EspCamDetectionDTO.java
package com.dto.sensor;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EspCamDetectionDTO {

    @JsonProperty("deviceId")
    private String deviceId;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("status")
    private String status;

    @JsonProperty("alert")
    private String alert;

    @JsonProperty("image_url") // CRITICAL: Maps to underscore version from ESP32/Lambda
    private String imageUrl; // S3 or direct upload link

    // Empty constructor needed by Jackson
    public EspCamDetectionDTO() {
    }

    // Constructor
    public EspCamDetectionDTO(String deviceId, String timestamp, String status, String alert, String imageUrl) {
        this.deviceId = deviceId;
        this.timestamp = timestamp;
        this.status = status;
        this.alert = alert;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAlert() {
        return alert;
    }

    public void setAlert(String alert) {
        this.alert = alert;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public String toString() {
        return "EspCamDetectionDTO{" +
                "deviceId='" + deviceId + '\'' +
                ", timestamp='" + timestamp + '\'' +
                ", status='" + status + '\'' +
                ", alert='" + alert + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}
