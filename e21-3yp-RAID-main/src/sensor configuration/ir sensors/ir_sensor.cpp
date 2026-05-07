#include <Arduino.h>
#include "ir_sensor.h"

namespace
{
    struct IRPinConfig
    {
        int muxPinA;
        int muxPinB;
        int muxPinC;
        int ledInPin;
        int irOutPin;
        const char *profileName;
    };

    // ==========================================
    // CALIBRATED THRESHOLDS (Calculated from V_N and V_C)
    // S0, S1, S2(dead), S3(dead), S4, S5, S6, S7
    // ==========================================
    const int THRESHOLDS[IR_SENSOR_COUNT] = {303, 292, 0, 0, 295, 318, 380, 361}; 

    // ==========================================
    // MASKING: Set to false if a sensor is physically dead
    // Index 2 and Index 3 are disabled based on hardware failure
    // ==========================================
    const bool SENSOR_ACTIVE[IR_SENSOR_COUNT] = {true, true, false, false, true, true, true, true};

#if defined(CONFIG_IDF_TARGET_ESP32S3)
    constexpr IRPinConfig PIN_CONFIG = {4, 3, 2, 6, 1, "ESP32-S3"};
#else
    // Updated LED IN to Pin 32
    constexpr IRPinConfig PIN_CONFIG = {25, 26, 27, 14, 34, "ESP32-Classic"};
#endif

    void selectOutput(int channel)
    {
        digitalWrite(PIN_CONFIG.muxPinA, channel & 0x01);
        digitalWrite(PIN_CONFIG.muxPinB, (channel >> 1) & 0x01);
        digitalWrite(PIN_CONFIG.muxPinC, (channel >> 2) & 0x01);
        
        // Increased delay to allow CD4051 Multiplexer to physically switch
        delayMicroseconds(150); 
    }
}

void initIRSensors()
{
    pinMode(PIN_CONFIG.muxPinA, OUTPUT);
    pinMode(PIN_CONFIG.muxPinB, OUTPUT);
    pinMode(PIN_CONFIG.muxPinC, OUTPUT);
    pinMode(PIN_CONFIG.ledInPin, OUTPUT);
    pinMode(PIN_CONFIG.irOutPin, INPUT);
    
    // Configure ADC for maximum range (0V - 3.1V)
    analogReadResolution(12);
    analogSetAttenuation(ADC_11db);

    // Keep IR emitter enabled constantly
    digitalWrite(PIN_CONFIG.ledInPin, HIGH);
    delay(50);
}

IRScanResult scanIRArray()
{
    IRScanResult result{};
    result.crackDetected = false;
    result.minValue = 4095;

    // --- STEP 1: SCAN ALL SENSORS ---
    for (int i = 0; i < IR_SENSOR_COUNT; ++i)
    {
        selectOutput(i);
        
        // DISCARD READ: Clear the ESP32's internal ADC capacitor
        analogRead(PIN_CONFIG.irOutPin);
        delayMicroseconds(50);
        
        // Take 3 quick readings and average them to kill electrical noise
        int total = 0;
        for(int j = 0; j < 3; j++) {
            total += analogRead(PIN_CONFIG.irOutPin);
        }
        result.values[i] = total / 3;

        // Track the lowest value for reporting
        if (SENSOR_ACTIVE[i] && result.values[i] < result.minValue)
        {
            result.minValue = result.values[i];
        }
    }

    // --- STEP 2: PAIR-BASED CRACK DETECTION ---
    for (int i = 0; i < 4; i++) {
        int sA = i;
        int sB = i + 4;

        bool crackInPair = false;

        // If Sensor A is active AND drops below its specific threshold
        if (SENSOR_ACTIVE[sA] && result.values[sA] < THRESHOLDS[sA]) {
            crackInPair = true;
        }
        
        // If Sensor B is active AND drops below its specific threshold
        if (SENSOR_ACTIVE[sB] && result.values[sB] < THRESHOLDS[sB]) {
            crackInPair = true;
        }

        // If ANY active sensor in the pair saw a crack, trigger the global alert
        if (crackInPair) {
            result.crackDetected = true;
            break; 
        }
    }

    return result;
}