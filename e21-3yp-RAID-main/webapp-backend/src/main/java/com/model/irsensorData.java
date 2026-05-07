package com.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

/**
 * Data Model / Entity Class for DynamoDB.
 * * The @DynamoDbBean annotation tells the AWS SDK that this Java class
 * is a direct representation of a table in our DynamoDB database.
 * Every instance of this class represents one single row (one crack reading).
 */
@DynamoDbBean
public class irsensorData {

    // We use standard Java "camelCase" naming conventions for our variables here
    // to keep our Java code clean and standard, regardless of how the database is
    // named.
    private String sensorId;
    private String timestamp;
    private String deviceId;
    private boolean crackDetected;
    private String status;
    private String imageUrl;
    private int uptime;
    private double latitude;
    private double longitude;

    /**
     * @DynamoDbPartitionKey: Marks this field as the Primary Key (PK) for the
     *                        table.
     *                        DynamoDB uses this to physically group data on its
     *                        servers.
     *                        * @DynamoDbAttribute("SensorID"): The "Translator".
     *                        This forces Java to map
     *                        our 'sensorId' variable strictly to the exact database
     *                        column named "SensorID".
     *                        This prevents silent mapping failures caused by
     *                        capitalization differences.
     */
    @DynamoDbPartitionKey
    @DynamoDbAttribute("SensorID")
    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    /**
     * @DynamoDbSortKey: Marks this field as the Sort Key (SK).
     *                   This allows us to organize multiple readings from the same
     *                   sensor chronologically.
     */
    @DynamoDbSortKey
    @DynamoDbAttribute("timestamp")
    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    // Standard attribute mapping. Maps Java 'deviceId' to DB 'deviceId'.
    @DynamoDbAttribute("deviceId")
    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    /**
     * CRITICAL FIX: In Java, boolean getters automatically start with "is".
     * Without this annotation, AWS looks for a DB column named "isCrackDetected".
     * The annotation forces it to look for our actual DB column "crack_detected".
     */
    @DynamoDbAttribute("crack_detected")
    public boolean isCrackDetected() {
        return crackDetected;
    }

    public void setCrackDetected(boolean crackDetected) {
        this.crackDetected = crackDetected;
    }

    @DynamoDbAttribute("status")
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @DynamoDbAttribute("image_url")
    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @DynamoDbAttribute("uptime")
    public int getUptime() {
        return uptime;
    }

    public void setUptime(int uptime) {
        this.uptime = uptime;
    }

    @DynamoDbAttribute("latitude")
    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    @DynamoDbAttribute("longitude")
    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }
}

// This is a 1-to-1 map of your DynamoDB table. It tells Java exactly what
// columns exist in your database so it can translate the JSON into a Java
// Object.