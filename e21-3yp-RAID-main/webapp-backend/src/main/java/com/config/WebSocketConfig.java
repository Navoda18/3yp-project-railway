package com.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // 1. The Endpoint: This is the URL React will use to establish the connection.
        // We enable SockJS as a fallback just in case the university network blocks raw
        // WebSockets.
        registry.addEndpoint("/raid-websocket")
                .setAllowedOriginPatterns("*") // Allows React on port 5173/3000 to connect
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // 2. The Broadcast Channel: We set up a prefix for messages going OUT to React
        registry.enableSimpleBroker("/topic");

        // 3. The Input Channel: (Optional for this project) Prefix for messages coming
        // IN from React
        registry.setApplicationDestinationPrefixes("/app");
    }
}

/*
 * ===========================================================
 * WEBSOCKET CONFIGURATION
 * ===========================================================
 * 
 * PURPOSE:
 * --------
 * This class configures real-time WebSocket communication
 * between the Spring Boot backend and React frontend using
 * STOMP messaging protocol.
 * 
 * -----------------------------------------------------------
 * CONNECTION SETUP:
 * -----------------------------------------------------------
 * 
 * 1. Endpoint Registration:
 * - URL: /raid-websocket
 * - Used by frontend (React) to establish WebSocket connection.
 * - SockJS fallback is enabled to support networks that
 * block native WebSockets.
 * 
 * Example connection:
 * ws://localhost:8080/raid-websocket
 * 
 * 2. CORS Configuration:
 * - Allows frontend apps (React running on different ports)
 * to connect to backend WebSocket endpoint.
 * - Currently allows all origins (*), suitable for development.
 * 
 * -----------------------------------------------------------
 * MESSAGE BROKER CONFIGURATION:
 * -----------------------------------------------------------
 * 
 * 3. Simple Broker (/topic):
 * - Enables server-side message broadcasting.
 * - Any message sent to "/topic/**" is pushed to all
 * subscribed frontend clients.
 * 
 * Example:
 * backend sends → /topic/cracks
 * frontend receives → real-time updates
 * 
 * 4. Application Prefix (/app):
 * - Defines prefix for messages sent FROM frontend TO backend.
 * - Example: /app/sendMessage
 * - Not heavily used in current IoT streaming setup,
 * but available for future expansion.
 * 
 * -----------------------------------------------------------
 * DATA FLOW:
 * -----------------------------------------------------------
 * 
 * ESP32 → AWS IoT → Spring MQTT Listener →
 * Backend Processing → WebSocket (/topic/cracks) →
 * React Frontend (Live UI Updates)
 * 
 * -----------------------------------------------------------
 * SUMMARY:
 * -----------------------------------------------------------
 * This configuration enables real-time communication by:
 * 
 * ✔ Establishing WebSocket connection endpoint
 * ✔ Enabling fallback support (SockJS)
 * ✔ Setting up message broadcasting system
 * ✔ Allowing frontend-backend communication structure
 * 
 * ===========================================================
 */