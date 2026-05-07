#ifndef ULTRASONIC_SENSOR_H
#define ULTRASONIC_SENSOR_H

struct UltrasonicResult {
    bool obstacleDetected;
    float distanceCm;
};

void initUltrasonicSensor();
UltrasonicResult scanUltrasonic();

#endif