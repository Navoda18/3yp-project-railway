# Backend Architecture: RAID (Railway Autonomous Crack Detection)

## 🏗️ High-Level Overview
The RAID system utilizes a decoupled, event-driven, hybrid cloud architecture. It bridges hardware edge-computing (ESP32) with a serverless AWS ingestion pipeline and a highly concurrent Spring Boot microservice. 

To ensure maximum fault tolerance and zero-latency monitoring, the data pipeline is split into a **"Cold Path"** (for persistent storage and reporting) and a **"Hot Path"** (for real-time WebSocket telemetry).

## 🔀 The Dual-Path Data Pipeline

### 1. The Edge Ingestion Layer (ESP32 -> AWS IoT Core)
* **Protocol:** MQTT over port 8883.
* **Security:** Mutual TLS (mTLS) with device-specific X.509 certificates ensuring Zero-Trust hardware authentication.
* **Reliability:** Configured with **QoS 1 (At Least Once)**. If the autonomous robot loses cellular connection in a tunnel, it queues the telemetry locally and republishes upon reconnection, guaranteeing zero data loss for critical track defects.

### 2. The Cold Path: Persistent Storage (AWS Serverless)
When an MQTT message arrives at the AWS Broker, it triggers the persistent storage flow:
* **AWS IoT Rules Engine:** Acts as a shift-left filter (`SELECT * FROM 'device/+/+' WHERE crack_detected = true`), immediately discarding nominal readings to save cloud compute costs.
* **AWS Lambda:** A Python-based serverless function intercepts the filtered alert, normalizes the JSON schema, and executes the database write.
* **Amazon DynamoDB:** A NoSQL database utilizing a highly optimized partition key strategy (`SensorID`) for O(1) query performance during historical data retrieval and daily CSV report generation.

### 3. The Hot Path: Real-Time Telemetry (Spring Boot -> React)
Simultaneously, the data bypasses the database entirely to feed the live dashboard:
* **MQTT Channel Adapter:** The Spring Boot backend operates as a secure MQTT Client inside the AWS VPC, actively subscribed to the `device/+/+` topic wildcard.
* **In-Memory Translation:** The exact millisecond a hardware alert is published, Spring Boot intercepts the raw JSON and maps it to a secure Data Transfer Object (DTO) in memory.
* **STOMP / WebSockets:** The DTO is immediately broadcasted over an open WebSocket connection to the React frontend, updating the user interface in O(1) time without the need for expensive HTTP polling.

## 💻 Technology Stack
* **Language:** Java 17
* **Framework:** Spring Boot 3.x (Spring Web, Spring WebSocket, Spring Integration MQTT)
* **Cloud Infrastructure:** AWS IoT Core, AWS Lambda, Amazon DynamoDB
* **Security:** OpenSSL, PKCS12 Java KeyStores, IAM Roles

## 🧠 Key Engineering Decisions
1. **Database Decoupling:** By routing real-time data through WebSockets directly from the MQTT broker, DynamoDB is strictly reserved for historical storage. This drastically reduces read/write costs and prevents database bottlenecking as the fleet of robots scales.
2. **Event-Driven Over Request-Driven:** Transitioning from REST polling to a Pub/Sub WebSocket model reduced idle server load by over 90% and brought end-to-end alert latency down to milliseconds.

## 🚀 Local Setup & Run Instructions
1. Clone the repository.
2. Generate your unique X.509 backend certificates via AWS IoT Core.
3. Bundle the certificates into a PKCS12 KeyStore using OpenSSL and place the `backend-keystore.p12` file in `src/main/resources`.
4. Update `application.properties` with your specific AWS ATS Endpoint URL.
5. Run `mvn spring-boot:run` or execute `WebappBackendApplication.java`.