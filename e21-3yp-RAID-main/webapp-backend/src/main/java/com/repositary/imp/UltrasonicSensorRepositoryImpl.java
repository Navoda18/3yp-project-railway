package com.repositary.imp;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.model.UltrasonicSensorData;
import com.repositary.UltrasonicSensorRepository;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Expression;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

@Repository
public class UltrasonicSensorRepositoryImpl extends UltrasonicSensorRepository {
	private final DynamoDbTable<UltrasonicSensorData> table;

	public UltrasonicSensorRepositoryImpl(DynamoDbEnhancedClient enhancedClient) {
		this.table = enhancedClient.table("ultrasonic_sensor_logs", TableSchema.fromBean(UltrasonicSensorData.class));
	}

	@Override
	public List<UltrasonicSensorData> getAllData() {
		return table.scan().items().stream().collect(Collectors.toList());
	}

	@Override
	public List<UltrasonicSensorData> getDataByDeviceAndSensor(String deviceId, String sensorId) {
		QueryConditional queryConditional = QueryConditional.keyEqualTo(k -> k.partitionValue(sensorId));

		Expression filterExpression = Expression.builder()
				.expression("deviceId = :devId")
				.putExpressionValue(":devId", AttributeValue.builder().s(deviceId).build())
				.build();

		QueryEnhancedRequest request = QueryEnhancedRequest.builder()
				.queryConditional(queryConditional)
				.filterExpression(filterExpression)
				.build();

		return table.query(request).items().stream().toList();
	}

	@Override
	public UltrasonicSensorData save(UltrasonicSensorData data) {
		table.putItem(data);
		return data;
	}
}
