package com.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.dto.sensor.UltrasonicSensorDataDTO;
import com.mapper.UltrasonicSensorMapper;
import com.model.UltrasonicSensorData;
import com.repositary.imp.UltrasonicSensorRepositoryImpl;

@Service
public class UltrasonicSensorService {
	private final UltrasonicSensorRepositoryImpl repository;
	private final UltrasonicSensorMapper mapper;
	private final UltrasonicEventHandler ultrasonicEventHandler;

	public UltrasonicSensorService(UltrasonicSensorRepositoryImpl repository, UltrasonicSensorMapper mapper,
			UltrasonicEventHandler ultrasonicEventHandler) {
		this.repository = repository;
		this.mapper = mapper;
		this.ultrasonicEventHandler = ultrasonicEventHandler;
	}

	public List<UltrasonicSensorDataDTO> getAllSensorData() {
		List<UltrasonicSensorData> rawData = repository.getAllData();
		return rawData.stream()
				.map(mapper::toDTO)
				.collect(Collectors.toList());
	}

	public List<UltrasonicSensorDataDTO> getSpecificSensorData(String deviceId, String sensorId) {
		List<UltrasonicSensorData> rawData = repository.getDataByDeviceAndSensor(deviceId, sensorId);
		return rawData.stream()
				.map(mapper::toDTO)
				.collect(Collectors.toList());
	}

	public UltrasonicSensorDataDTO saveSensorData(UltrasonicSensorDataDTO dto) {
		UltrasonicSensorData entity = ultrasonicEventHandler.toEntityForPersistence(dto, mapper);
		if (entity == null) {
			return null;
		}
		UltrasonicSensorData saved = repository.save(entity);
		return mapper.toDTO(saved);
	}
}
