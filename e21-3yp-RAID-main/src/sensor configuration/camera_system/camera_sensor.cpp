 #include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include "esp_camera.h"
#include "soc/soc.h"           // Required for Brownout fix
#include "soc/rtc_cntl_reg.h"  // Required for Brownout fix
#include "secrets.h"           // Ensure ssid, password, botToken, chatId, and AWS certs are here

// --- CAMERA PINS (AI-THINKER) ---
#define PWDN_GPIO_NUM  32
#define RESET_GPIO_NUM -1
#define XCLK_GPIO_NUM  0
#define SIOD_GPIO_NUM  26
#define SIOC_GPIO_NUM  27
#define Y9_GPIO_NUM    35
#define Y8_GPIO_NUM    34
#define Y7_GPIO_NUM    39
#define Y6_GPIO_NUM    36
#define Y5_GPIO_NUM    21
#define Y4_GPIO_NUM    19
#define Y3_GPIO_NUM    18
#define Y2_GPIO_NUM    5
#define VSYNC_GPIO_NUM 25
#define HREF_GPIO_NUM  23
#define PCLK_GPIO_NUM  22

#define HARDWARE_TRIGGER_PIN 13
volatile bool captureRequested = false;

void IRAM_ATTR onHardwareTrigger() {
    captureRequested = true;
}


WiFiClientSecure net;
PubSubClient mqttClient(net);

// --- TELEGRAM UPLOAD ---
String sendPhotoToTelegram(camera_fb_t *fb) {
    WiFiClientSecure tlsClient;
    tlsClient.setInsecure(); // Telegram API works fine without CA check on ESP32
    tlsClient.setTimeout(20000); // 20 seconds timeout for mobile hotspots

    Serial.println("Connecting to Telegram API...");
    if (!tlsClient.connect("api.telegram.org", 443)) return "Connect Failed";

    String head = "--ESP32CAM\r\nContent-Disposition: form-data; name=\"photo\"; filename=\"esp32.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n";
    String tail = "\r\n--ESP32CAM--\r\n";
    uint32_t totalLen = head.length() + fb->len + tail.length();

    tlsClient.println("POST /bot" + String(botToken) + "/sendPhoto?chat_id=" + String(chatId) + " HTTP/1.1");
    tlsClient.println("Host: api.telegram.org");
    tlsClient.println("Content-Length: " + String(totalLen));
    tlsClient.println("Content-Type: multipart/form-data; boundary=ESP32CAM");
    tlsClient.println();
    tlsClient.print(head);
    
    uint8_t *fbBuf = fb->buf;
    size_t fbLen = fb->len;
    for (size_t n=0; n<fbLen; n=n+1024) {
        if (n+1024 < fbLen) tlsClient.write(fbBuf, 1024);
        else tlsClient.write(fbBuf, fbLen - n);
        fbBuf += 1024;
    }
    tlsClient.print(tail);
    return "OK";
}

// --- NEW: S3 UPLOAD FUNCTION ---
String sendPhotoToS3(camera_fb_t *fb) {
    HTTPClient http;
    
    // ⚠️ REPLACE WITH YOUR BUCKET DETAILS
    String bucketName = "railway-system-photos-01-533350584731-eu-north-1-an"; 
    String region = "eu-north-1"; 
    
    // This is the standard S3 URL format
    String fileName = "railway_snap_" + String(millis()) + ".jpg";
    String url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;

    Serial.println("Uploading to S3: " + url);
    
    http.begin(url);
    http.addHeader("Content-Type", "image/jpeg");
    
    // Note: This requires your S3 bucket to have 'Public Write' or a 
    // specific Bucket Policy enabled for testing.
    int httpResponseCode = http.PUT(fb->buf, fb->len);

    String resultUrl = "FAILED";
    if (httpResponseCode == 200 || httpResponseCode == 201) {
        Serial.printf("S3 Upload Success: %d\n", httpResponseCode);
        resultUrl = url; // Return the URL so MQTT can send it to DynamoDB
    } else {
        Serial.printf("S3 Upload Failed: %d\n", httpResponseCode);
    }
    
    http.end(); // CRITICAL: Frees up memory for MQTT
    return resultUrl;
}

// --- CAPTURE & AWS NOTIFY ---
// --- CAPTURE & AWS NOTIFY ---
void captureAndSend() {
    camera_fb_t * fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        return;
    }

    // 1. Send to Telegram (For Alerts)
    Serial.println("Snap! Sending to Telegram...");
    sendPhotoToTelegram(fb);

    // 2. Send to S3 (For Frontend URL)
    Serial.println("Uploading to S3...");
    String s3Url = sendPhotoToS3(fb);
    
    // --- THIS IS THE NEW HANDSHAKE CODE ---
    // If S3 upload worked, send the URL back to the Main IR Board
    if (s3Url != "FAILED") {
        StaticJsonDocument<200> doc;
        doc["image_url"] = s3Url; 
        
        char buffer[200];
        serializeJson(doc, buffer);
        
        // Publish to the internal topic the Main board is listening to!
        mqttClient.publish("device/esp-001/camera_url", buffer);
        Serial.println("Sent S3 URL back to Main Board!");
    } else {
        Serial.println("S3 Upload Failed. Cannot send URL.");
    }
    // --------------------------------------

    // WE DELETED THE OLD AWS NOTIFY STUFF HERE
    
    esp_camera_fb_return(fb);
    Serial.println("Cycle Complete.");
}


// --- AWS CALLBACK (Listen for Friend's IR) ---
// void mqttCallback(char* topic, byte* payload, unsigned int length) {
//     Serial.print("Message arrived on topic: ");
//     Serial.println(topic);

//     String message;
//     for (int i = 0; i < length; i++) message += (char)payload[i];

//     // Listen specifically for your friend's trigger
//     if (message.indexOf("\"crackDetected\": true") != -1) {
//         Serial.println("TRIGGER: IR Sensor detected a crack!");
//         captureAndSend();
//     }
// }

// --- AWS CALLBACK (Listen for Friend's IR & Manual Overrides) ---
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived on topic: ");
    Serial.println(topic);

    // Parse the incoming JSON properly
    StaticJsonDocument<512> doc;
    DeserializationError error = deserializeJson(doc, payload, length);

    if (error) {
        Serial.print("JSON Parse failed: ");
        Serial.println(error.c_str());
        return;
    }

    // Check if the payload says a crack was detected
    if (doc["crack_detected"] == true || doc["crackDetected"] == true) {
        Serial.println("MQTT TRIGGER: Crack event received!");
        captureRequested = true; // Set the same flag the hardware uses
    }
}
// --- AWS CONNECT ---
void connectAWS() {
    net.setCACert(AWS_CERT_CA);
    net.setCertificate(AWS_CERT_CRT);
    net.setPrivateKey(AWS_CERT_PRIVATE);
    mqttClient.setServer(aws_endpoint, 8883);
    mqttClient.setCallback(mqttCallback);

    Serial.print("Connecting to AWS IoT...");
    while (!mqttClient.connect("ESP32_CAM")) {
        Serial.print(".");
        delay(1000);
    }
    Serial.println(" Connected!");
    mqttClient.subscribe("device/esp-001/IR_Bottom"); // Listen to crack detection data
}

void setup() {
    // 1. DISABLE BROWNOUT (Crucial for heat/stability)
    WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);

    pinMode(HARDWARE_TRIGGER_PIN, INPUT_PULLDOWN);
    attachInterrupt(digitalPinToInterrupt(HARDWARE_TRIGGER_PIN), onHardwareTrigger, RISING);


    Serial.begin(115200);

    // 2. CAMERA CONFIG
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM; config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM; config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM; config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM; config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM; config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM; config.pin_href = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM; config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM; config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;

    if (esp_camera_init(&config) != ESP_OK) {
        Serial.println("Camera init failed");
        return;
    }

    WiFi.mode(WIFI_STA); 
    Serial.println("\nScan started");
    int n = WiFi.scanNetworks();
    Serial.printf("%d networks found\n", n);
    for (int i = 0; i < n; ++i) {
    Serial.println(WiFi.SSID(i));
    }
    // 3. WIFI & TIME SYNC
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
    Serial.println("\nWiFi Connected");

    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.print("Syncing Time");
    while (time(nullptr) < 100000) { delay(500); Serial.print("."); }
    Serial.println("\nTime Synced!");

    connectAWS();
}

void loop() {
    if (!mqttClient.connected()) {
        connectAWS();
    }
    mqttClient.loop();

    if (captureRequested) {
        captureRequested = false; // Reset the flag immediately
        Serial.println("\n🚨 TRIGGER ACTIVATED! Capturing Photo...");
        captureAndSend();
    }

    // Debug SNAP via Serial
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();
        if (cmd == "SNAP") captureAndSend();
    }
}