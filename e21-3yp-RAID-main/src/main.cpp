#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Arduino.h>
#include <ArduinoJson.h>
#include <time.h>
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "sensor configuration/ir sensors/ir_sensor.h"
#include "sensor configuration/gps sensors/gps_sensor.h"

// ================= Configuration =================
#define CAMERA_TRIGGER_PIN 4
const char *ssid = "Redmi Note 10";
const char *password = "200170201635";
const char *mqtt_server = "a32k5hknxy25aw-ats.iot.eu-north-1.amazonaws.com";
const char *CLIENT_ID = "esp32";
const String DEVICE_ID = "esp-001";
const char *SENSOR_ID = "IR_Bottom";

String getIsoTimestamp();

bool waitingForCamera = false;
unsigned long cameraWaitStart = 0;
int savedIrMinValue = 0;

// ================= AWS IoT =================
WiFiClientSecure espClient;
PubSubClient client(espClient);

// ================= Certificates =================
const char AWS_CERT_CA[] = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5

-----END CERTIFICATE-----
)EOF";

const char AWS_CERT_CRT[] = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDWTCCAkGgAwIBAgIUUVSAA6k1G5Lx1dQ1gF9JsO6r3JYwDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI2MDUwNzE2Mjcx
M1oXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAK32YZuZbdhlU/RDnWuC
/21ZzmwEXmCMHqPjUiwhlPulia2/ctqT+t3qG9Jhwf+jWGBorDTA7V/3G0JcbpRY
/riu6y7R9Sdfg8yOqEFRviXHpKEfE84V0DjEQCpivQJJhDCec1msF6BOhbZl1xsl
RZwRSDJ4G9KTgWkptPyeB3p5oVa7Ml85MM2EkKjEAyoDrnq85jZk+feb8nyp5g/U
O5EXIonjbtmfr+mS3mZbtU3B3s1KN+jdKIZ6e4Rxymt/Ye3cGpJZXL1U4WoLfqn5
SJCpROg7+S4kKHdHmeySxudszLx3NOXolb1gvV2Xm9tElmxz3CQeUq4/bl19J0zB
IPECAwEAAaNgMF4wHwYDVR0jBBgwFoAUrU+ORq+FAwhDP44V5EFidA3koS0wHQYD
VR0OBBYEFFfaZZEmw57kAE3tyopcRSld+dvtMAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQB/ZXFEYlF7+u19nmAm3s1uetGR
6akDcPejD+Uon4Z8rm4CC2VOihaC4GeUMOtZUkDrcydn+PeoPDt+JBF3lzvN6hho
C2szBiBQ9Xjl3XOJOeo9OKKY2NCEJDheyiRLrwDSxToh50fZDWChUze1gFYCC6AF
laWVjspcTq1x1JYOWvtaERnQAru6gdCynN3uo3WQTO+QDcuJJ8lsz3FHa8ftPKQN
tC9dQYceNcVFUnyALFe99gV9UlFzVKOMz7EisFaHisXF3NE3MT0a/pEvsat/8CkM
5TQrH2MsE4ZWSOs32fSIMk0mcs8/WLav1lcrtDlHvhFgYQ1o1C713GBQa+y7
-----END CERTIFICATE-----
)EOF";
const char AWS_CERT_PRIVATE[] = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEArfZhm5lt2GVT9EOda4L/bVnObAReYIweo+NSLCGU+6WJrb9y
2pP63eob0mHB/6NYYGisNMDtX/cbQlxulFj+uK7rLtH1J1+DzI6oQVG+JcekoR8T
zhXQOMRAKmK9AkmEMJ5zWawXoE6FtmXXGyVFnBFIMngb0pOBaSm0/J4HenmhVrsy
XzkwzYSQqMQDKgOuerzmNmT595vyfKnmD9Q7kRciieNu2Z+v6ZLeZlu1TcHezUo3
6N0ohnp7hHHKa39h7dwakllcvVThagt+qflIkKlE6Dv5LiQod0eZ7JLG52zMvHc0
5eiVvWC9XZeb20SWbHPcJB5Srj9uXX0nTMEg8QIDAQABAoIBAG3ihLNZzjXzg312
vFguDhRPtwEqHUdVGwGg1MYFjGsMnJQAq5cABGXqvBo/H+DPmEKFu8ky2H5Ww4Q+
iKbyNCwKaYpQm098mO88aXGhJcANhKM10zfJNZa1+GYNqqBoObTQUcKh3uam0vVt
DNwbxgWYMQeYMNLp08PO0YEEfWrRoMAkYBUTudIRIYdVxuM6qJo7BgdlozTu76sm
nB3e685BU+o8DnAHVN78YZGqb9c4x3OhoUBlFmun95662G+GmRYOWlLyu98XzIkr
PJPpEWdkHAwawdG6WDgdWp3gDrwM1oak2dBYkrMvgAnVWkr4TyQfkbH8wCX1iWB3
WFcBP0ECgYEA3RsggO+HcbIuf8B9I/wIKm9dbHlvQAx9/TtUUrLp+JN8P8V12+zV
aZAQ3k/f6zM+XV7mQhhSm8aPRLFrAgpbwXeOM4aDrPqFqeoPY6oHXBztkAgY4Its
ZYb8cx+be0vt2I8vbIhAdC2LBXn8hmOPyHFylmczN1HfPuBYdaS/9fkCgYEAyWqd
S5H9+kOxhJOcB9VWWpy2UPCEpDcUp04YrHkp2QnneuWfwMwqJwtNl++sLrhAfclJ
9psj2+tMHbgUb5/CJO6mG+yH5IYtWJpsQq6HQnml7g07cXW9izrpoZU//a6OxnFr
eVnzPFvVB88wnnKpnfV42Qm3CvGttNKSNtbjYLkCgYALP4QJyyWyzQO8kAhNulaY
Ag5YpFzaf0gxh8Eka+GnOamKfPsf8w5wTlntVVbo2jSD/33rQt2A+zrynav58Jj2
YKSlTmSIej4uhK+/vDifoQEc4KyTT8R17cYN/T+lqBkzeSVKeiv9PQvjfW8xTwNT
iSHxMNLUL6ARzMvzQCxb0QKBgQCtSUyK98/KwPK5XUWgd6sTykAQ4t07aygZyNbx
jEy0rhC5a1VGSmD5tn/LeChrCZpynftEb7UqQAX8i6MJZiliHPBMlfNUaRwaXsFF
nWJBjudzJ2887k9kugrHOeEUIFo14N7WSM074MYnMdpid8P2YnrWP8V7ZPJN39xr
0fVOAQKBgQDLSPLwIvyA59f/pqmhhjsVwt+0VJvhQ9TpyNOnjz82fgg19cmrSO2o
LhXrMEgaXsXFmBeZdAulAx+enMxxBr4H9rwA8YEzriMeE7EifHEhqMX1HHQvo3rw
Eh+SH5j2w02TGhLLWYpIAYQ6VMYxBN39PnZaECUdCdWoZlo+tHr7EQ==
-----END RSA PRIVATE KEY-----
)EOF";

// ================= Helper: MQTT State to String =================
String mqttStateToString(int state)
{
  switch (state)
  {
  case -4:
    return "MQTT_CONNECTION_TIMEOUT";
  case -3:
    return "MQTT_CONNECTION_LOST";
  case -2:
    return "MQTT_CONNECT_FAILED";
  case -1:
    return "MQTT_DISCONNECTED";
  case 0:
    return "MQTT_CONNECTED";
  case 1:
    return "MQTT_CONNECT_BAD_PROTOCOL";
  case 2:
    return "MQTT_CONNECT_BAD_CLIENT_ID";
  case 3:
    return "MQTT_CONNECT_UNAVAILABLE";
  case 4:
    return "MQTT_CONNECT_BAD_CREDENTIALS";
  case 5:
    return "MQTT_CONNECT_UNAUTHORIZED";
  default:
    return "UNKNOWN (" + String(state) + ")";
  }
}

// ================= WiFi Connection =================
void connectWiFi()
{
  Serial.println("\n========== WiFi ==========");
  Serial.print("Target SSID  : ");
  Serial.println(ssid);
  Serial.print("Chip MAC     : ");
  Serial.println(WiFi.macAddress());
  Serial.println("Starting WiFi connection...");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(1000);
    attempts++;
    Serial.printf("  [%2ds] Status: %d", attempts, WiFi.status());
    // Status codes: 0=IDLE, 1=NO_SSID, 3=CONNECTED, 4=CONNECT_FAILED, 6=DISCONNECTED
    switch (WiFi.status())
    {
    case WL_NO_SSID_AVAIL:
      Serial.print(" -> SSID NOT FOUND");
      break;
    case WL_CONNECT_FAILED:
      Serial.print(" -> WRONG PASSWORD / AUTH FAILED");
      break;
    case WL_CONNECTION_LOST:
      Serial.print(" -> CONNECTION LOST");
      break;
    case WL_DISCONNECTED:
      Serial.print(" -> DISCONNECTED (trying...)");
      break;
    default:
      break;
    }
    Serial.println();

    if (attempts >= 30)
    {
      Serial.println("  !! TIMEOUT after 30s. Restarting ESP32...");
      ESP.restart();
    }
  }
  Serial.println("  >> WiFi CONNECTED!");
  Serial.print("  IP Address  : ");
  Serial.println(WiFi.localIP());
  Serial.print("  Gateway     : ");
  Serial.println(WiFi.gatewayIP());
  Serial.print("  DNS         : ");
  Serial.println(WiFi.dnsIP());
  Serial.print("  Signal (dBm): ");
  Serial.println(WiFi.RSSI());
  Serial.println("==========================\n");
}
// ================= AWS IoT Connection =================
void connectAWS()
{
  Serial.println("========== AWS IoT ==========");
  Serial.print("Broker       : ");
  Serial.println(mqtt_server);
  Serial.print("Port         : 8883");
  Serial.println();
  Serial.print("Client ID    : ");
  Serial.println(CLIENT_ID);

  Serial.println("Loading TLS certificates...");
  espClient.setCACert(AWS_CERT_CA);
  espClient.setCertificate(AWS_CERT_CRT);
  espClient.setPrivateKey(AWS_CERT_PRIVATE);
  Serial.println("  CA Cert    : Loaded");
  Serial.println("  Device Cert: Loaded");
  Serial.println("  Private Key: Loaded");

  client.setServer(mqtt_server, 8883);
  client.setBufferSize(1024);
  Serial.println("MQTT server configured. Attempting connection...");

  int attempt = 0;
  while (!client.connected())
  {
    attempt++;
    Serial.printf("\n  [Attempt %d] Connecting to AWS IoT...\n", attempt);

    if (client.connect(CLIENT_ID))
    {
      Serial.println("  >> MQTT CONNECTED to AWS IoT Core!");
    }
    else
    {
      int rc = client.state();
      Serial.print("  !! FAILED. State code: ");
      Serial.println(mqttStateToString(rc));

      if (rc == -2)
      {
        Serial.println("     >> TLS Handshake likely failed.");
        Serial.println("        Check: certificate validity, endpoint URL, clock sync.");
      }
      else if (rc == 5)
      {
        Serial.println("     >> Unauthorized. Check AWS IoT Policy allows clientId & actions.");
      }
      else if (rc == 2)
      {
        Serial.println("     >> Bad Client ID. Ensure CLIENT_ID matches your AWS IoT Policy.");
      }

      Serial.println("  Retrying in 5 seconds...");
      delay(5000);

      if (attempt >= 5)
      {
        Serial.println("  !! 5 failed attempts. Restarting ESP32...");
        ESP.restart();
      }
    }
  }
  Serial.println("=============================\n");
}

// ================= Unified AWS Publisher =================
void publishUnifiedAlert(String imageUrl, const IRScanResult &irData)
{
  StaticJsonDocument<512> doc;
  doc["sensorId"] = SENSOR_ID;
  doc["deviceId"] = DEVICE_ID;
  doc["timestamp"] = getIsoTimestamp();
  doc["crack_detected"] = true;
  doc["status"] = "CRITICAL_DEFECT";
  doc["irSensor"] = irData.minValue;
  doc["image_url"] = imageUrl;
  GPSData gps = readGPSData(); // ADD FROM HERE
  doc["latitude"] = gps.valid ? gps.latitude : 0.0;
  doc["longitude"] = gps.valid ? gps.longitude : 0.0;
  doc["gps_valid"] = gps.valid; // ADD TO HERE

  JsonArray irArray = doc.createNestedArray("irArray");
  for (int i = 0; i < IR_SENSOR_COUNT; ++i)
  {
    irArray.add(irData.values[i]);
  }

  String payload;
  serializeJson(doc, payload);
  String topic = "device/" + DEVICE_ID + "/IR_Bottom";

  if (client.publish(topic.c_str(), payload.c_str()))
  {
    Serial.println("\n🚨 UNIFIED ALERT PUBLISHED: " + payload);
  }
  else
  {
    Serial.println("❌ Failed to publish unified alert.");
  }
}

// ================= MQTT Callback =================

IRScanResult lastIrScanResult; // Global to hold values until camera returns

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
  // Catch the URL from the camera board
  if (String(topic) == "device/esp-001/camera_url")
  {
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (!error && waitingForCamera)
    {
      String url = doc["image_url"].as<String>();
      Serial.println("Received S3 URL from Camera!");
      publishUnifiedAlert(url, lastIrScanResult); // Publish the final row with IR values!
      waitingForCamera = false;
    }
  }
}

void syncTime()
{
  Serial.println("Syncing time with NTP...");

  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  time_t now = time(nullptr);
  while (now < 8 * 3600 * 2)
  {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }

  Serial.println("\nTime synchronized!");

  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);

  Serial.print("Current time: ");
  Serial.println(asctime(&timeinfo));
}

String getIsoTimestamp()
{
  time_t now = time(nullptr);
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);

  char buffer[32];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

unsigned long lastHeartbeat = 0;
unsigned long lastCriticalAlert = 0; // Prevents database spam if the robot stops on a crack
char mqtt_topic[64];                 // Permanent buffer for the MQTT topic
int consecutiveCracks = 0;           // Counter to filter out sensor noise
unsigned long lastSensorScan = 0;

constexpr unsigned long SENSOR_SCAN_INTERVAL_MS = 50;
constexpr int REQUIRED_CONSECUTIVE_CRACKS = 6; // ~300ms stable crack indication
// ================= Setup =================
void setup()
{
  // CRITICAL: Disable brownout detector to prevent restart loops when camera + WiFi power on simultaneously
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  pinMode(CAMERA_TRIGGER_PIN, OUTPUT);
  digitalWrite(CAMERA_TRIGGER_PIN, LOW);

  Serial.begin(115200);
  delay(1000); // Let Serial stabilize

  Serial.println("\n\n##############################");
  Serial.println("#   ESP32 AWS IoT Boot       #");
  Serial.println("##############################");
  Serial.print("SDK Version : ");
  Serial.println(ESP.getSdkVersion());
  Serial.print("Free Heap   : ");
  Serial.println(ESP.getFreeHeap());
  Serial.print("Chip Model  : ");
  Serial.println(ESP.getChipModel());
  Serial.println();
  Serial.println("[BOOT] Brownout detector disabled for camera+WiFi operation.");

  connectWiFi();
  syncTime();
  connectAWS();
  initIRSensors();
  initGPSSensor();

  client.setCallback(mqttCallback);
  // Prepare MQTT Topic
  snprintf(mqtt_topic, sizeof(mqtt_topic), "device/%s/IR_Bottom", DEVICE_ID.c_str());

  // Subscribe to command topic
  String commandTopic = "device/" + DEVICE_ID + "/command";
  Serial.print("Subscribing to: ");
  Serial.println(commandTopic);

  if (client.subscribe(commandTopic.c_str()))
  {
    Serial.println("  >> Subscription SUCCESSFUL");
  }
  if (client.subscribe("device/esp-001/camera_url"))
  {
    Serial.println("  >> Camera URL Subscription SUCCESSFUL");
  }
  else
  {
    Serial.println("  !! Subscription FAILED");
  }

  snprintf(mqtt_topic, sizeof(mqtt_topic), "device/%s/IR_Bottom", DEVICE_ID.c_str());

  Serial.println("\n>>> Setup complete. Entering loop...\n");
}

// ================= Loop =================

void loop()
{
  static IRScanResult irScan{};
  static bool irScanReady = false;
  updateGPSStream();

  // 1. Maintain Connection & Re-subscribe to topics
  if (!client.connected())
  {
    Serial.println("\n!! MQTT connection LOST. Reconnecting...");
    connectAWS();

    // Re-subscribe to topics after reconnection
    String commandTopic = "device/" + DEVICE_ID + "/command";

    client.subscribe(commandTopic.c_str());
    client.subscribe("device/esp-001/camera_url");

    Serial.println("Topics re-subscribed after reconnection.");
  }

  // 2. Process Incoming Messages
  client.loop();

  unsigned long now = millis();

  // 3. Read sensors on a fixed cadence so debounce is time-based, not loop-speed based.
  if (!irScanReady || (now - lastSensorScan >= SENSOR_SCAN_INTERVAL_MS))
  {
    lastSensorScan = now;
    irScan = scanIRArray();
    irScanReady = true;

    if (irScan.crackDetected)
    {
      consecutiveCracks++;
    }
    else
    {
      consecutiveCracks = 0;
    }
  }

  bool crack_detected = (consecutiveCracks >= REQUIRED_CONSECUTIVE_CRACKS);

  // =========================================================
  // THE HYBRID HEARTBEAT LOGIC
  // =========================================================

  // SCENARIO A: The Interrupt (Immediate Critical Alert)
  // Triggers if a crack is found AND 2 seconds have passed since the last alert
  // SCENARIO A: The Interrupt (Hardware Trigger + Wait for Image)
  if (crack_detected && !waitingForCamera && (now - lastCriticalAlert > 3000))
  {
    lastCriticalAlert = now;
    lastHeartbeat = now;

    // 1. FIRE THE HARDWARE TRIGGER (Zero Latency)
    digitalWrite(CAMERA_TRIGGER_PIN, HIGH);
    delay(50);
    digitalWrite(CAMERA_TRIGGER_PIN, LOW);

    // 2. Save the IR state and start the waiting timer
    lastIrScanResult = irScan; // Store full result
    savedIrMinValue = irScan.minValue;
    waitingForCamera = true;
    cameraWaitStart = now;

    Serial.println("Hardware triggered! Waiting for Camera to return S3 URL...");
  }

  // SCENARIO A.2: The Timeout (If camera crashes or fails to upload)
  if (waitingForCamera && (now - cameraWaitStart > 60000))
  { // 60 second timeout
    Serial.println("Camera upload timed out. Publishing alert without image.");
    publishUnifiedAlert("No Image (Timeout)", lastIrScanResult);
    waitingForCamera = false;
  }
  // SCENARIO B: The Routine Heaartbeat (Nominal Status)
  // Only triggers if the track is safe AND 30 seconds have passed
  else if (now - lastHeartbeat >= 30000)
  {
    lastHeartbeat = now;
    StaticJsonDocument<512> doc;
    doc["sensorId"] = SENSOR_ID;
    doc["deviceId"] = DEVICE_ID;
    doc["timestamp"] = getIsoTimestamp();
    doc["crackDetected"] = crack_detected;
    doc["crack_detected"] = false;
    doc["status"] = "NOMINAL_HEARTBEAT";
    doc["severity"] = 0.10;
    doc["irSensor"] = irScan.minValue;
    doc["uptime"] = now / 1000;
    GPSData gps = readGPSData(); // ADD FROM HERE
    doc["latitude"] = gps.valid ? gps.latitude : 0.0;
    doc["longitude"] = gps.valid ? gps.longitude : 0.0;
    doc["gps_valid"] = gps.valid; // ADD TO HERE

    JsonArray irArray = doc.createNestedArray("irArray");
    for (int i = 0; i < IR_SENSOR_COUNT; ++i)
    {
      irArray.add(irScan.values[i]);
    }

    String payload;
    serializeJson(doc, payload);
    String topic = "device/" + DEVICE_ID + "/IR_Bottom";

    if (client.publish(topic.c_str(), payload.c_str()))
    {
      Serial.println("\n💚 Heartbeat Check-in: " + payload);

      // Print system diagnostics to the Serial Monitor during the heartbeat
      Serial.printf("   Uptime    : %lu s\n", now / 1000);
      Serial.printf("   Free Heap : %u bytes\n", ESP.getFreeHeap());
      Serial.printf("   WiFi RSSI : %d dBm\n", WiFi.RSSI());
      Serial.printf("   IR Min    : %d\n", irScan.minValue);
    }
    else
    {
      Serial.println("❌ Failed to publish heartbeat.");
    }
  }
}