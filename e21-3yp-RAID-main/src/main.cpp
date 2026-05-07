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
const char *mqtt_server = "a141eqbs4ue48l-ats.iot.eu-north-1.amazonaws.com";
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
MIIDWTCCAkGgAwIBAgIUYU80NJEOmXPqrS9EPdKO4mcmn4YwDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI2MDMxMTA3MzIy
MFoXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALWLZSO5efvXKf5jey57
UZqrpkcuzi1FX7LdwHMzlTrrxGQlWV2fD75u4E7GOVfcrl9ZAsj8secj/23WMveU
87xz1UhtmantRwXz6jjpP9VyOkXqD7HjfWhxXW6oIkhuZfNrhacR6cfBc9V8iuje
bPL28qTidH847d+oPtkS7fRqRyhk91LBsdldqs8h+3Gkit0ZcxVERr7v1/i/ZYOI
6pvPQ5kGE/mZP3PTap2q58psZI5O6uhMbFf2djn1sPOjdcAupYzyLSwOjw4gJlsb
5yGPCZM6xgHIBkV8DpTB3kQOetKiDW2dJ6YzeWx7qV6bUYBsY6S79MC6/QX02yoE
KH8CAwEAAaNgMF4wHwYDVR0jBBgwFoAUj0s/lciho5qMSqh59zVrKWVFDs4wHQYD
VR0OBBYEFMnmHFwOB9qy+kW+Q7vktG/722EoMAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQCc/Zsb8le1vJubdmV5V7FZcv7z
eC0pS7hRIJo/qdzYhojU6aE0zGzYZ/KkjsyRkGkfoPR4pe99kfkPFPGlGFZzmdHz
4TleCRfVnSoZxhd0kmDxw66iRUyPWeIiRT3NjH70yYrAx9xKf8K4/j4YU3Gq+K5w
LbqN8Oj1ncYyh2Tnv52L3XVgiY9IWh8bCs1BRe5L+HwegEv5s4x1Py2aRGI5oiyF
KON0AkQeNm5P+2fLy7Ht2gKwEePDAfB2s9QI5PG99NKcYP0KScgR91UoyeXf0Ymk
sYTGZwunvQTZCI+Jw5tFttCEJJz7i/rNKkX+iS/lG6h20kKRwynHpztyIBUc
-----END CERTIFICATE-----
[4/26/2026 1:45 PM] Chamodii: )EOF";
const char AWS_CERT_PRIVATE[] = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAtYtlI7l5+9cp/mN7LntRmqumRy7OLUVfst3AczOVOuvEZCVZ
XZ8Pvm7gTsY5V9yuX1kCyPyx5yP/bdYy95TzvHPVSG2Zqe1HBfPqOOk/1XI6ReoP
seN9aHFdbqgiSG5l82uFpxHpx8Fz1XyK6N5s8vbypOJ0fzjt36g+2RLt9GpHKGT3
UsGx2V2qzyH7caSK3RlzFURGvu/X+L9lg4jqm89DmQYT+Zk/c9Nqnarnymxkjk7q
6ExsV/Z2OfWw86N1wC6ljPItLA6PDiAmWxvnIY8JkzrGAcgGRXwOlMHeRA560qIN
bZ0npjN5bHupXptRgGxjpLv0wLr9BfTbKgQofwIDAQABAoIBAHrX2hY0WUB6NaY3
NpEbTPq2D4u3NjgX60ujFaheTSpTgs6pHzFkgki/yfRD2WWEpFFMb8AEjXT0PNDb
0h0Jo2vvjXC3CPWc4yQ6ClF8M3+BDcFlQj2Cy8cyfqB0EM6mNUJjjUqhqmlKk9Dv
tycf6uT1CPddbKrxoLRoqi5EytNJOuiAST/1PtQK/Qs+Ml+y/i6pKhQc3eUaUn40
SCndXrgJhToKIDVHYeKDZxwDYtGwLD0SrGmVywsT8akEEDLpOcRFaOFGEuE+eP//
W6KFheLNW5P9Eiw33pUn1I7DhFVS/HoPm7Dt0T+i7AbUS5BtpO3+7NvlUIiHVi6D
XoBxcnECgYEA4BO0lKSpEIkMpwt/xi7rohFw1Ujnt9Cx7piSEePV/GYKdZe6ZIJG
ClwGMk0ihGsItuHI7s0PpvkPtUgQxnaRuu1F8AXj2uyjvOx6DfagCLrXxLkaqDrR
oEVUd2wyJKiBFEt0ruQlGDpx8lSl8fLPIPQntHBXZAIRs3LyH2YnYN0CgYEAz2h9
zkWYKHJ+Dyt9jZW6IkV60of1yodwVV60z9SLtPKJmm77ehUzmbaXju7O5GZVhiJ6
r0Tkg1MzNEeWSJo5o4/77QL7Cg6kFeDOiqL8I0HVB//FlifLg3h1Bz1L/guAjSo/
FOVurDOQC5pj68miEETBf6e+YD4i/yn1yPZ3iwsCgYEAx0gfKLdMeJ06OHHcoDfo
bgmOzND665paNHVSK0DydXeWw8A+D9dgTSRMin3ZPeUnKeah2edbjUch9jpyWN7o
elM9CNtkKracZI/3eOWmrDznWli5YXZ2KlCeb1s1OS73JUJ6MnRKnUKVRkyMDSLB
nXAmw63JuvKwJWUL+mrSiK0CgYAQ5LfqhyyfjsPJxIcTczCX/gTFBSH1/xYdPfuI
Og2vDVo74/JDvVpYmNC7aaQcYmFw7XoEsJ3UPICdL3+EJluvgNjKM0XzScH/rjHk
hOX4kTIi1qhnVJJ1AOi3UDzSUmmEFf7RWuaqzABdkZO17tRucss39JfDCwyar/Y/
CiQuhQKBgQDR5PJMxcT2ca2WxLOJUOOsEkgZCh4Ybkp4tyRvt7VUQ9jq9PN/Kka8
SDFxfKE+qwUiPm05dJAiwnJht/aIoU44m4H+1jSm04OX6K9mNj0MLET3NG6gE/Jz
krMtsh2qcmRX7yFXzYXiFNWahWMUvgJb1bE02EtOawY8itbItBJ6eg==
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