package com.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

@DynamoDbBean
public class UltrasonicSensorData {
	private String sensorId;
	private String deviceId;
	private String timestamp;
	private double distanceCm;
	private boolean obstacleDetected;
	private double latitude;
	private double longitude;

	@DynamoDbPartitionKey
	@DynamoDbAttribute("SensorID")
	public String getSensorId() {
		return sensorId;
	}

	public void setSensorId(String sensorId) {
		this.sensorId = sensorId;
	}

	@DynamoDbSortKey
	@DynamoDbAttribute("timestamp")
	public String getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(String timestamp) {
		this.timestamp = timestamp;
	}

	@DynamoDbAttribute("deviceId")
	public String getDeviceId() {
		return deviceId;
	}

	public void setDeviceId(String deviceId) {
		this.deviceId = deviceId;
	}

	@DynamoDbAttribute("distanceCm")
	public double getDistanceCm() {
		return distanceCm;
	}

	public void setDistanceCm(double distanceCm) {
		this.distanceCm = distanceCm;
	}

	@DynamoDbAttribute("obstacleDetected")
	public boolean isObstacleDetected() {
		return obstacleDetected;
	}

	public void setObstacleDetected(boolean obstacleDetected) {
		this.obstacleDetected = obstacleDetected;
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
