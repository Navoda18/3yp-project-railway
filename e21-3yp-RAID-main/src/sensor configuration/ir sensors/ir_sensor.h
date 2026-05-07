#ifndef IR_SENSOR_H
#define IR_SENSOR_H

constexpr int IR_SENSOR_COUNT = 8;

struct IRScanResult
{
  bool crackDetected;
  int minValue;
  int values[IR_SENSOR_COUNT];
};

// Initializes the MUX control pins and IR emitter drive pin.
void initIRSensors();

// Scans all 8 sensors and applies pair-based crack detection.
IRScanResult scanIRArray();

#endif