package com.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.dto.sensor.IRSensorDataDTO;
import com.dto.sensor.LocationDTO;
import com.mapper.IRSensorMapper;
import com.model.irsensorData;

@Service
public class CrackEventHandler {

    private static final Logger logger = LoggerFactory.getLogger(CrackEventHandler.class);

    public boolean validateAndLogConfirmedCrack(IRSensorDataDTO event) {
        LocationDTO location = event != null ? event.getLocation() : null;
        Double lat = location != null ? location.getLat() : null;
        Double lng = location != null ? location.getLng() : null;

        if (event == null) {
            logger.warn("Crack event ignored: payload is null");
            return false;
        }

        if (!event.isCrackDetected()) {
            logger.debug("Crack event ignored: crackDetected=false for sensorId={}", event.getSensorId());
            return false;
        }

        if (lat == null || lng == null) {
            logger.warn("Crack event ignored: missing GPS location for sensorId={} timestamp={}",
                    event.getSensorId(), event.getTimestamp());
            return false;
        }

        if (Double.compare(lat, 0.0d) == 0 && Double.compare(lng, 0.0d) == 0) {
            logger.warn("Crack event ignored: invalid zero GPS location for sensorId={} timestamp={}",
                    event.getSensorId(), event.getTimestamp());
            return false;
        }

        logger.info("Confirmed crack event sensorId={} deviceId={} timestamp={} status={} lat={} lng={}",
                event.getSensorId(),
                event.getDeviceId(),
                event.getTimestamp(),
                event.getStatus(),
                lat,
                lng);
        return true;
    }

    public irsensorData toEntityForPersistence(IRSensorDataDTO event, IRSensorMapper mapper) {
        if (!validateAndLogConfirmedCrack(event)) {
            return null;
        }

        irsensorData entity = mapper.toEntity(event);
        LocationDTO location = event.getLocation();
        if (location != null) {
            entity.setLatitude(location.getLat());
            entity.setLongitude(location.getLng());
        }
        return entity;
    }
}
