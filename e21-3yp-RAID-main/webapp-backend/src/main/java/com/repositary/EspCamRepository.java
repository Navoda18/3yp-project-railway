package com.repositary;

import com.model.EspCamDetection;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class EspCamRepository {

    private final DynamoDbTable<EspCamDetection> table;

    public EspCamRepository(DynamoDbEnhancedClient enhancedClient) {
        // Create a reference to the table using the bean schema
        this.table = enhancedClient.table("ir_cracks_detection", TableSchema.fromBean(EspCamDetection.class));
    }

    public void save(EspCamDetection detection) {
        table.putItem(detection);
    }

    public List<EspCamDetection> findAll() {
        // Scan the table and return all items
        return table.scan().items().stream().collect(Collectors.toList());
    }

    public List<EspCamDetection> findLatestBySensor(String sensorId) {
        return table.scan() // For a proper Query, you'd use .query() but scan works for small scale
                .items()
                .stream()
                .filter(item -> item.getSensorId().equals(sensorId))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp())) // Sort latest first
                .limit(10) // Only take the last 10 photos
                .collect(Collectors.toList());
    }
}