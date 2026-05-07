package com.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.dto.sensor.IRSensorDataDTO;
import com.mapper.IRSensorMapper;
import com.model.irsensorData;
import com.repositary.IRSensorRepository;

// 1. The Annotation
@Service
public class IRSensorService {

    // 2. The Dependencies
    private final IRSensorRepository repository;
    private final IRSensorMapper mapper;
    private final CrackEventHandler crackEventHandler;

    // 3. Dependency Injection (Constructor)
    public IRSensorService(IRSensorRepository repository, IRSensorMapper mapper, CrackEventHandler crackEventHandler) {
        this.repository = repository;
        this.mapper = mapper;
        this.crackEventHandler = crackEventHandler;
    }

    // 4. The Business Logic
    public List<IRSensorDataDTO> getAllCrackData() {

        // Step A: Fetch the raw, heavy entities from the database
        List<irsensorData> rawData = repository.getAllData();

        // Step B: Transform the raw entities into lightweight DTOs
        return rawData.stream()
                .map(entity -> mapper.toDTO(entity))
                .collect(Collectors.toList());
    }

    public List<IRSensorDataDTO> getSpecificCracks(String deviceId, String sensorId) {

        // 1. Ask the repository for the filtered data
        List<irsensorData> rawData = repository.getCracksByDeviceAndSensor(deviceId, sensorId);

        // 2. Map the heavy entities to lightweight DTOs
        return rawData.stream()
                .map(entity -> mapper.toDTO(entity))
                .collect(Collectors.toList());
    }

    public IRSensorDataDTO saveSensorData(IRSensorDataDTO dto) {
        irsensorData entity = crackEventHandler.toEntityForPersistence(dto, mapper);
        if (entity == null) {
            return null;
        }

        irsensorData saved = repository.save(entity);
        return mapper.toDTO(saved);
    }

}

/*
 * ============================================================
 * IRSensorService - Service Layer Class
 * ============================================================
 *
 * PURPOSE:
 * This class contains the business logic for handling IR sensor data.
 * It acts as an intermediate layer between the Controller and Repository.
 *
 * WHY THIS CLASS EXISTS:
 * - To separate business logic from database operations
 * - To keep controllers clean and focused only on handling requests
 * - To make the application easier to maintain, test, and scale
 *
 * HOW IT WORKS:
 * 1. The Controller calls this service when it needs sensor data.
 * 2. This service requests raw data from the Repository (database layer).
 * 3. The raw data (Entity objects) may contain unnecessary/internal fields.
 * 4. The service uses a Mapper to convert Entities into DTOs (clean objects).
 * 5. The DTO list is returned to the Controller.
 *
 * KEY COMPONENTS:
 *
 * - IRSensorRepository:
 * Handles direct database access and returns IRSensorData (Entity objects).
 *
 * - IRSensorMapper:
 * Converts IRSensorData (Entity) → IRSensorDataDTO (safe, lightweight object).
 *
 * METHOD EXPLANATION:
 *
 * getAllCrackData():
 * ------------------
 * - Fetches all IR sensor records from the database.
 * - Uses Java Streams to transform each entity into a DTO.
 * - Returns a list of DTOs to the caller.
 *
 * FLOW:
 * Controller → Service → Repository → Database
 * Database → Repository → Service (map to DTO) → Controller
 *
 * BENEFITS:
 * - Clean architecture (Separation of Concerns)
 * - Better security (DTO hides sensitive fields)
 * - Reusable business logic
 * - Easier debugging and testing
 *
 * ============================================================
 */