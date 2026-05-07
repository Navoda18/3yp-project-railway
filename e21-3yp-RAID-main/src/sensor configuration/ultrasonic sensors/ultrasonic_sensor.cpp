#include <Arduino.h>
#include "ultrasonic_sensor.h"

#define TRIG_PIN 25
#define ECHO_PIN 26
#define OBSTACLE_THRESHOLD_CM 30.0

void initUltrasonicSensor()
{
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    digitalWrite(TRIG_PIN, LOW);
}

UltrasonicResult scanUltrasonic()
{
    UltrasonicResult result{};

    // Send trigger pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Read echo duration (timeout 30ms = ~5m max range)
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);

    // Timeout = no echo = no obstacle
    if (duration == 0)
    {
        result.distanceCm = -1;
        result.obstacleDetected = false;
        return result;
    }

    result.distanceCm = (duration * 0.0343f) / 2.0f;
    result.obstacleDetected = (result.distanceCm > 0 &&
                               result.distanceCm < OBSTACLE_THRESHOLD_CM);
    return result;
}