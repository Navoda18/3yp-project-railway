package com.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Configuration
public class DynamoDbConfig {

    @Value("${aws.region}")
    private String region;

    @Value("${aws.accessKeyId}")
    private String accessKey;

    @Value("${aws.secretKey}")
    private String secretKey;

    @Bean
    public DynamoDbClient dynamoDbClient() {
        return DynamoDbClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .build(); // Builds and returns the DynamoDB client
    }

    @Bean
    // It makes it easier to work with tables, objects, and queries.
    public DynamoDbEnhancedClient dynamoDbEnhancedClient(DynamoDbClient dynamoDbClient) {
        return DynamoDbEnhancedClient.builder()
                // Uses the previously created DynamoDbClient
                .dynamoDbClient(dynamoDbClient)
                .build();
    }
}

// This configuration class sets up the connection between our Spring Boot app
// and AWS DynamoDB.
//
// It creates two main objects (beans):
// 1. DynamoDbClient → used to communicate with DynamoDB (send/receive data)
// 2. DynamoDbEnhancedClient → a higher-level helper that makes working with
// tables easier
//
// It uses AWS credentials and region to securely connect to DynamoDB.