package com.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Marks this class as a configuration class in Spring Boot
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    // This method is used to define CORS (Cross-Origin Resource Sharing) rules
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {

        // Apply CORS configuration to all endpoints that start with /api/
        registry.addMapping("/api/**")

                // Define which frontend URLs (origins) are allowed to access this backend
                .allowedOrigins(
                        "https://cepdnaclk.github.io", // deployed frontend (GitHub Pages)
                        "http://localhost:3000", // React development server
                        "http://localhost:5173" // Vite development server
                )

                // Define which HTTP methods are allowed for cross-origin requests
                .allowedMethods(
                        "GET", // Fetch data
                        "POST", // Create new data
                        "PUT", // Update existing data
                        "DELETE", // Delete data
                        "OPTIONS" // Preflight request (sent by browser before actual request)
                )

                // Allow all request headers (e.g., Authorization, Content-Type)
                .allowedHeaders("*")

                // Allow credentials such as cookies, session IDs, and Authorization headers
                // (JWT)
                // NOTE: When this is true, you CANNOT use "*" for allowedOrigins
                .allowCredentials(true)

                // Cache the CORS preflight response for 3600 seconds (1 hour)
                // This reduces the number of OPTIONS requests sent by the browser
                .maxAge(3600);
    }
}