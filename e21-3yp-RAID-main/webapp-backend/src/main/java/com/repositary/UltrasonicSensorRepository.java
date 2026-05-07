package com.repositary;

import java.util.List;

import com.model.UltrasonicSensorData;

public class UltrasonicSensorRepository {
	public List<UltrasonicSensorData> getAllData() {
		throw new UnsupportedOperationException("UltrasonicSensorRepository must be overridden by the implementation bean");
	}

	public List<UltrasonicSensorData> getDataByDeviceAndSensor(String deviceId, String sensorId) {
		throw new UnsupportedOperationException("UltrasonicSensorRepository must be overridden by the implementation bean");
	}

	public UltrasonicSensorData save(UltrasonicSensorData data) {
		throw new UnsupportedOperationException("UltrasonicSensorRepository must be overridden by the implementation bean");
	}
}
