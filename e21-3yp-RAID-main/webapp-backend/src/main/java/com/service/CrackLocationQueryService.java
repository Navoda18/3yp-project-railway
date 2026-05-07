package com.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.dto.sensor.IRSensorDataDTO;
import com.dto.sensor.LocationDTO;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

@Service
public class CrackLocationQueryService {

    private final DynamoDbClient dynamoDbClient;

    @Value("${aws.dynamodb.tableName}")
    private String tableName;

    public CrackLocationQueryService(DynamoDbClient dynamoDbClient) {
        this.dynamoDbClient = dynamoDbClient;
    }

    public List<IRSensorDataDTO> findAllCrackLocations() {
        ScanRequest request = ScanRequest.builder()
                .tableName(tableName)
                .build();

        ScanResponse response = dynamoDbClient.scan(request);
        return toDtos(response.items());
    }

    public List<IRSensorDataDTO> findRecentCrackLocations(int hours) {
        Instant cutoff = Instant.now().minus(hours, ChronoUnit.HOURS);

        ScanRequest request = ScanRequest.builder()
                .tableName(tableName)
                .filterExpression("attribute_exists(timestamp)")
                .build();

        ScanResponse response = dynamoDbClient.scan(request);

        List<IRSensorDataDTO> recent = new ArrayList<>();
        for (Map<String, AttributeValue> item : response.items()) {
            String ts = stringValue(item, "timestamp");
            if (ts.isEmpty()) {
                continue;
            }
            try {
                Instant itemTs = Instant.parse(ts);
                if (!itemTs.isBefore(cutoff)) {
                    recent.add(toDto(item));
                }
            } catch (Exception ignored) {
                // Skip invalid timestamp values while keeping query read-only.
            }
        }

        return recent;
    }

    private List<IRSensorDataDTO> toDtos(List<Map<String, AttributeValue>> items) {
        List<IRSensorDataDTO> results = new ArrayList<>();
        for (Map<String, AttributeValue> item : items) {
            results.add(toDto(item));
        }
        return results;
    }

    private IRSensorDataDTO toDto(Map<String, AttributeValue> item) {
        IRSensorDataDTO dto = new IRSensorDataDTO();

        // Normalize casing/legacy variations used by different writers.
        dto.setSensorId(firstNonEmptyString(item, "sensorId", "SensorID", "sensorID"));
        dto.setTimestamp(firstNonEmptyString(item, "timestamp", "Timestamp"));
        dto.setDeviceId(firstNonEmptyString(item, "deviceId", "DeviceID", "deviceID"));
        dto.setCrackDetected(firstBoolean(item, false, "crackDetected", "crack_detected", "CrackDetected"));
        dto.setStatus(firstNonEmptyString(item, "status", "Status"));
        dto.setSeverity(firstNumber(item, 0.0d, "severity", "Severity"));
        dto.setImageUrl(firstNonEmptyString(item, "imageUrl", "image_url", "ImageURL", "photoUrl", "url"));

        double lat = firstNumber(item, 0.0d, "lat", "latitude", "Latitude");
        double lng = firstNumber(item, 0.0d, "lng", "longitude", "Longitude");
        boolean valid = firstBoolean(item, false, "valid", "locationValid");
        int satellites = firstInt(item, 0, "satellites", "Satellites");

        LocationDTO location = new LocationDTO(lat, lng, valid, satellites);
        dto.setLocation(location);

        return dto;
    }

    private String stringValue(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        if (value == null || value.s() == null) {
            return "";
        }
        return value.s();
    }

    private boolean booleanValue(Map<String, AttributeValue> item, String key) {
        AttributeValue value = item.get(key);
        if (value == null || value.bool() == null) {
            return false;
        }
        return value.bool();
    }

    private double numberValue(Map<String, AttributeValue> item, String key, double defaultValue) {
        AttributeValue value = item.get(key);
        if (value == null || value.n() == null) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(value.n());
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }

    private int intValue(Map<String, AttributeValue> item, String key, int defaultValue) {
        AttributeValue value = item.get(key);
        if (value == null || value.n() == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.n());
        } catch (NumberFormatException ex) {
            return defaultValue;
        }
    }

    private String firstNonEmptyString(Map<String, AttributeValue> item, String... keys) {
        for (String key : keys) {
            String value = stringValue(item, key);
            if (!value.isEmpty()) {
                return value;
            }
        }
        return "";
    }

    private double firstNumber(Map<String, AttributeValue> item, double defaultValue, String... keys) {
        for (String key : keys) {
            AttributeValue value = item.get(key);
            if (value != null && value.n() != null) {
                return numberValue(item, key, defaultValue);
            }
        }
        return defaultValue;
    }

    private int firstInt(Map<String, AttributeValue> item, int defaultValue, String... keys) {
        for (String key : keys) {
            AttributeValue value = item.get(key);
            if (value != null && value.n() != null) {
                return intValue(item, key, defaultValue);
            }
        }
        return defaultValue;
    }

    private boolean firstBoolean(Map<String, AttributeValue> item, boolean defaultValue, String... keys) {
        for (String key : keys) {
            AttributeValue value = item.get(key);
            if (value != null && value.bool() != null) {
                return booleanValue(item, key);
            }
        }
        return defaultValue;
    }
}
