package com.mapper;

import org.springframework.stereotype.Component;

import com.dto.sensor.LocationDTO;
import com.dto.sensor.UltrasonicSensorDataDTO;
import com.model.UltrasonicSensorData;

@Component
public class UltrasonicSensorMapper {
	public UltrasonicSensorDataDTO toDTO(UltrasonicSensorData entity) {
		if (entity == null) {
			return null;
		}

		return new UltrasonicSensorDataDTO(
				entity.getSensorId(),
				entity.getDeviceId(),
				entity.getTimestamp(),
				entity.getDistanceCm(),
				entity.isObstacleDetected(),
				new LocationDTO(entity.getLatitude(), entity.getLongitude()));
	}

	public UltrasonicSensorData toEntity(UltrasonicSensorDataDTO dto) {
		if (dto == null) {
			return null;
		}

		UltrasonicSensorData entity = new UltrasonicSensorData();
		entity.setSensorId(dto.getSensorId());
		entity.setDeviceId(dto.getDeviceId());
		entity.setTimestamp(dto.getTimestamp());
		entity.setDistanceCm(dto.getDistanceCm());
		entity.setObstacleDetected(dto.isObstacleDetected());
		if (dto.getLocation() != null) {
			entity.setLatitude(dto.getLocation().getLat());
			entity.setLongitude(dto.getLocation().getLng());
		}
		return entity;
	}
}
