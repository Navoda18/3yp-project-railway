package com.dto.sensor;

public class UltrasonicSensorDataDTO {
	private String sensorId;
	private String deviceId;
	private String timestamp;
	private double distanceCm;
	private boolean obstacleDetected;
	private LocationDTO location;

	public UltrasonicSensorDataDTO() {
	}

	public UltrasonicSensorDataDTO(String sensorId, String deviceId, String timestamp, double distanceCm, boolean obstacleDetected) {
		this.sensorId = sensorId;
		this.deviceId = deviceId;
		this.timestamp = timestamp;
		this.distanceCm = distanceCm;
		this.obstacleDetected = obstacleDetected;
	}

	public UltrasonicSensorDataDTO(String sensorId, String deviceId, String timestamp, double distanceCm,
			boolean obstacleDetected, LocationDTO location) {
		this.sensorId = sensorId;
		this.deviceId = deviceId;
		this.timestamp = timestamp;
		this.distanceCm = distanceCm;
		this.obstacleDetected = obstacleDetected;
		this.location = location;
	}

	public String getSensorId() {
		return sensorId;
	}

	public void setSensorId(String sensorId) {
		this.sensorId = sensorId;
	}

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

	public double getDistanceCm() {
		return distanceCm;
	}

	public void setDistanceCm(double distanceCm) {
		this.distanceCm = distanceCm;
	}

	public boolean isObstacleDetected() {
		return obstacleDetected;
	}

	public void setObstacleDetected(boolean obstacleDetected) {
		this.obstacleDetected = obstacleDetected;
	}

	public LocationDTO getLocation() {
		return location;
	}

	public void setLocation(LocationDTO location) {
		this.location = location;
	}
}
