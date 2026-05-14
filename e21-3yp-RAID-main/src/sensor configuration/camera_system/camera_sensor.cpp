#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "img_converters.h"      // for frame2jpg()
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "secrets.h"

// ── AI-THINKER PINS ─────────────────────────────────────
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define HARDWARE_TRIGGER_PIN 13

// ── S3 CONFIG ────────────────────────────────────────────
const char* S3_BUCKET = "railway-camera-photos";
const char* S3_REGION = "eu-north-1";

// ── GLOBALS ──────────────────────────────────────────────
volatile bool captureRequested = false;
WiFiClientSecure net;
PubSubClient mqttClient(net);



// ── CAMERA INIT ──────────────────────────────────────────
bool initCamera() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer   = LEDC_TIMER_0;
    config.pin_d0       = Y2_GPIO_NUM;
    config.pin_d1       = Y3_GPIO_NUM;
    config.pin_d2       = Y4_GPIO_NUM;
    config.pin_d3       = Y5_GPIO_NUM;
    config.pin_d4       = Y6_GPIO_NUM;
    config.pin_d5       = Y7_GPIO_NUM;
    config.pin_d6       = Y8_GPIO_NUM;
    config.pin_d7       = Y9_GPIO_NUM;
    config.pin_xclk     = XCLK_GPIO_NUM;
    config.pin_pclk     = PCLK_GPIO_NUM;
    config.pin_vsync    = VSYNC_GPIO_NUM;
    config.pin_href     = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn     = PWDN_GPIO_NUM;
    config.pin_reset    = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_RGB565;  // GC2145 only supports RGB565
    config.frame_size   = FRAMESIZE_QVGA;    // 320x240 — keeps JPEG small
    config.jpeg_quality = 12;
    config.fb_count     = 1;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init FAILED: 0x%x\n", err);
        return false;
    }
    Serial.println("Camera init SUCCESS (GC2145 RGB565 mode)");
    return true;
}

// ── S3 UPLOAD ────────────────────────────────────────────
String uploadToS3(uint8_t* jpegBuf, size_t jpegLen) {
    String fileName = "crack_" + String(millis()) + ".jpg";
    String url = "https://" + String(S3_BUCKET) + ".s3." +
                 String(S3_REGION) + ".amazonaws.com/" + fileName;

    Serial.println("Uploading to S3: " + url);
    Serial.printf("JPEG size: %d bytes\n", jpegLen);

    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "image/jpeg");
    http.setTimeout(30000); // 30 second timeout for mobile hotspot

    int responseCode = http.PUT(jpegBuf, jpegLen);

    String resultUrl = "FAILED";
    if (responseCode == 200 || responseCode == 201) {
        Serial.printf("S3 Upload SUCCESS: %d\n", responseCode);
        resultUrl = url;
    } else {
        Serial.printf("S3 Upload FAILED: %d\n", responseCode);
        Serial.println(http.errorToString(responseCode));
    }

    http.end();
    return resultUrl;
}

// ── CAPTURE AND SEND ─────────────────────────────────────
void captureAndSend() {
    Serial.println("Starting capture...");

    // Discard first frame — GC2145 first frame often has green tint
    camera_fb_t* fb = esp_camera_fb_get();
    if (fb) {
        esp_camera_fb_return(fb);
        delay(150);
    }

    // Capture real frame
    fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Frame capture FAILED");
        return;
    }

    Serial.printf("Raw frame: %d bytes (RGB565)\n", fb->len);

    // ── Convert RGB565 → JPEG ────────────────────────────
    uint8_t* jpegBuf = nullptr;
    size_t   jpegLen = 0;

    bool converted = frame2jpg(fb, 80, &jpegBuf, &jpegLen);

    // Return frame buffer immediately — free RAM for HTTP
    esp_camera_fb_return(fb);

    if (!converted || jpegBuf == nullptr || jpegLen == 0) {
        Serial.println("JPEG conversion FAILED");
        if (jpegBuf) free(jpegBuf);
        return;
    }

    Serial.printf("JPEG converted: %d bytes\n", jpegLen);

    // ── Upload to S3 ─────────────────────────────────────
    String s3Url = uploadToS3(jpegBuf, jpegLen);

    // Free JPEG buffer immediately after upload
    free(jpegBuf);

    // ── Send URL back to Main Board via MQTT ─────────────
    if (s3Url != "FAILED") {
        StaticJsonDocument<256> doc;
        doc["image_url"] = s3Url;
        char buffer[256];
        serializeJson(doc, buffer);

        if (mqttClient.publish("device/esp-001/camera_url", buffer)) {
            Serial.println("S3 URL sent to Main Board via MQTT ✅");
            Serial.println("URL: " + s3Url);
        } else {
            Serial.println("MQTT publish FAILED ❌");
        }
    } else {
        Serial.println("S3 failed — not sending URL to Main Board");
    }

    Serial.println("Capture cycle complete.");
}

// ── MQTT CALLBACK ─────────────────────────────────────────
// ── MQTT CALLBACK ─────────────────────────────────────────
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("MQTT message on topic: ");
    Serial.println(topic);

    // Cooldown: ignore triggers within 10 seconds of last capture
    static unsigned long lastCapture = 0;
    if (millis() - lastCapture < 10000) {
        Serial.println("Cooldown active — ignoring trigger");
        return;
    }

    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload, length);
    if (error) {
        Serial.println("JSON parse failed");
        return;
    }

    bool crackDetected = doc["crack_detected"] | doc["crackDetected"] | false;
    if (crackDetected) {
        Serial.println("MQTT crack trigger received!");
        captureRequested = true;
        lastCapture = millis(); // update cooldown timer
    }
}
// ── INTERRUPT ────────────────────────────────────────────
void IRAM_ATTR onHardwareTrigger() {
    static unsigned long lastTrigger = 0;
    unsigned long now = millis();
    if (now - lastTrigger > 10000) { // 10 second cooldown
        captureRequested = true;
        lastTrigger = now;
    }
}

// ── AWS CONNECT ───────────────────────────────────────────
void connectAWS() {
    net.setCACert(AWS_CERT_CA);
    net.setCertificate(AWS_CERT_CRT);
    net.setPrivateKey(AWS_CERT_PRIVATE);

    mqttClient.setBufferSize(512);
    mqttClient.setServer(aws_endpoint, 8883);
    mqttClient.setCallback(mqttCallback);

    int attempts = 0;
    Serial.print("Connecting to AWS IoT");
    while (!mqttClient.connect("ESP32_CAM")) {
        Serial.print(".");
        delay(1000);
        attempts++;
        if (attempts >= 10) {
            Serial.println("\nAWS connect FAILED after 10 attempts. Restarting...");
            ESP.restart();
        }
    }
    Serial.println("\nAWS IoT Connected ✅");
    mqttClient.subscribe("device/esp-001/IR_Bottom");
    Serial.println("Subscribed to IR_Bottom topic");
}

// ── SETUP ─────────────────────────────────────────────────
void setup() {
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);

    pinMode(HARDWARE_TRIGGER_PIN, INPUT_PULLDOWN);
    attachInterrupt(digitalPinToInterrupt(HARDWARE_TRIGGER_PIN),
                    onHardwareTrigger, RISING);

    Serial.begin(115200);
    delay(1000);

    Serial.println("\n============================");
    Serial.println("  ESP32-CAM Boot (GC2145)  ");
    Serial.println("============================");

    if (!initCamera()) {
        Serial.println("Camera failed. Restarting in 5s...");
        delay(5000);
        ESP.restart();
    }

    // WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    int wifiAttempts = 0;
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
        wifiAttempts++;
        if (wifiAttempts >= 40) {
            Serial.println("\nWiFi FAILED. Restarting...");
            ESP.restart();
        }
    }
    Serial.println("\nWiFi Connected ✅");
    Serial.println("IP: " + WiFi.localIP().toString());

    // Time sync — required for HTTPS
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.print("Syncing time");
    while (time(nullptr) < 100000) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nTime synced ✅");

   connectAWS();
    Serial.println("\n>>> Ready. Waiting for trigger...\n");
    // ← NOTHING ELSE HERE

}

// ── LOOP ──────────────────────────────────────────────────
void loop() {
    // Maintain MQTT connection
    if (!mqttClient.connected()) {
        Serial.println("MQTT disconnected. Reconnecting...");
        connectAWS();
    }
    mqttClient.loop();

    // Handle capture trigger
    if (captureRequested) {
        captureRequested = false;
        Serial.println("\n🚨 Trigger received! Capturing...");
        captureAndSend();
    }

    // Manual test via Serial
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();
        if (cmd == "SNAP") {
            Serial.println("Manual SNAP triggered");
            captureAndSend();
        }
    }
}