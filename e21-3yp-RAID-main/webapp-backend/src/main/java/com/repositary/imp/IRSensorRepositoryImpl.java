package com.repositary.imp;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.model.irsensorData;
import com.repositary.IRSensorRepository;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

// @Repository tells Spring Boot this class is responsible for database operations
@Repository
public class IRSensorRepositoryImpl implements IRSensorRepository {

    private final DynamoDbTable<irsensorData> table;

    // Spring Boot automatically passes the DynamoDB client you configured earlier
    // into this constructor
    public IRSensorRepositoryImpl(DynamoDbEnhancedClient enhancedClient) {
        // We tell the client exactly which table to look at ("ir_sensor_logs")
        // and which Java class maps to it (irsensorData.class)
        this.table = enhancedClient.table("ir_cracks_detection", TableSchema.fromBean(irsensorData.class));
    }

    @Override
    public List<irsensorData> getAllData() {
        // .scan() reads the whole table.
        // We then convert the AWS results into a standard Java List.
        return table.scan().items().stream().collect(Collectors.toList());
    }

    @Override
    public List<irsensorData> getCracksByDeviceAndSensor(String deviceId, String sensorId) {

        // 1. The Query: Jump directly to the physical partition for this SensorID
        // (Fast!)
        QueryConditional queryConditional = QueryConditional
                .keyEqualTo(k -> k.partitionValue(sensorId));

        // 2. The Filter: Once inside that partition, only grab rows matching this
        // deviceId
        Expression filterExpression = Expression.builder()
                .expression("deviceId = :devId")
                .putExpressionValue(":devId", AttributeValue.builder().s(deviceId).build())
                .build();

        // 3. Combine them and execute (scanIndexForward(false) sorts newest-first)
        QueryEnhancedRequest request = QueryEnhancedRequest.builder()
                .queryConditional(queryConditional)
                .filterExpression(filterExpression)
                .scanIndexForward(false)
                .build();

        // Run the query and return as a List
        return table.query(request).items().stream().toList();
    }

    @Override
    public irsensorData save(irsensorData data) {
        table.putItem(data);
        return data;
    }
}

// This class provides the actual implementation of the IRSensorRepository
// interface and handles communication with AWS DynamoDB.