package com.service;

import org.springframework.stereotype.Service;

import com.dto.sensor.LocationDTO;
import com.dto.sensor.UltrasonicSensorDataDTO;
import com.mapper.UltrasonicSensorMapper;
import com.model.UltrasonicSensorData;

@Service
public class UltrasonicEventHandler {

    public UltrasonicSensorData toEntityForPersistence(UltrasonicSensorDataDTO event, UltrasonicSensorMapper mapper) {
        if (event == null) {
            return null;
        }

        UltrasonicSensorData entity = mapper.toEntity(event);
        LocationDTO location = event.getLocation();
        if (location != null) {
            entity.setLatitude(location.getLat());
            entity.setLongitude(location.getLng());
        }

        return entity;
    }
}
