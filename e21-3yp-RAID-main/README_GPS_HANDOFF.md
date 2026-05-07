# GPS Handoff Guide

This document summarizes the GPS work already completed in this project and what still needs to be done next. It is written as a handoff for the person who will continue the ESP32 + GPS implementation.

## What has already been developed

### Firmware / ESP32 side
- ✅ The firmware now includes GPS support for the ESP32 pipeline.
- ✅ GPS module wired to ESP32 (TX→GPIO16, RX→GPIO17).
- ✅ TinyGPSPlus library already in `platformio.ini`.
- ✅ `gps_sensor.h` and `gps_sensor.cpp` completed.
- ✅ `main.cpp` updated — lat/lng added to MQTT payload.
- ✅ The publish payload was updated to include GPS-related fields such as:
  - `sensorId`
  - `crackDetected`
  - `severity`
  - `latitude`
  - `longitude`
  - `locationValid`
  - `satellites`
  - `timestamp`
- ✅ The payload is published to the MQTT topic `railway/cracks`.

### AWS / Lambda side
- ✅ The Lambda function `ProcessRailwayData` now accepts both:
  - the older test format with nested `location`
  - the newer flat GPS format
- ✅ The Lambda now writes GPS coordinates to DynamoDB successfully.
- ✅ DynamoDB updates are confirmed working after the Lambda fix.
- ✅ `LocationDTO.java` created.
- ✅ `CrackEventHandler.java` created.
- ✅ `CrackLocationQueryService.java` created.
- ✅ `CrackLocationController.java` created.
- ✅ `GET /api/crack-locations` endpoint working.
- ✅ `GET /api/crack-locations/recent?hours=24` working.
- ✅ `crack_handler.py` updated with lat/lng.
- ✅ Backend starts successfully on port 8080.
- ✅ `mqtt-keystore.p12` generated and configured.
- ✅ `application.properties` configured locally.

### Web app side
- ✅ The React app has been updated so new alerts can be received through the live alert context.
- ✅ The live map was refactored to redraw when new alerts arrive, instead of only showing the first render.
- ✅ The app now supports showing fresh data from the stream without requiring a page refresh.
- ✅ `MapPage.tsx` created with Leaflet (OpenStreetMap).
- ✅ `/map` route added to `App.tsx`.

## Current working payload format

Use this format for the real GPS pipeline:

```json
{
  "sensorId": "ESP32-001",
  "crackDetected": true,
  "severity": "HIGH",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "locationValid": true,
  "satellites": 7,
  "timestamp": "2026-04-19T10:30:00Z"
}
```

## What still needs to be done next

### On the ESP32 + GPS module side
- ✅ Wire the physical GPS module to the ESP32 board.
- ✅ Confirm the UART pins used by the GPS module.
- ⏳ TODO: Full end-to-end test with real ESP32 data.

### On the AWS side
- ✅ Confirm the IoT rule is still enabled and subscribed to `railway/cracks`.
- ✅ Confirm the Lambda trigger continues to work with real ESP32 messages.
- ✅ Confirm DynamoDB stores the new real GPS values correctly.

### On the frontend side
- ✅ Confirm the live dashboard updates when a new crack event arrives.
- ✅ Confirm the Live Map shows the newest alert and robot position correctly.
- ✅ Confirm the alert card and map marker use the new GPS values.
- ⏳ TODO: Frontend @/ path alias fix.

## Testing checklist

1. Power on the ESP32 + GPS module.
2. Wait for a valid GPS fix.
3. Publish one crack event to `railway/cracks`.
4. Check CloudWatch for a Lambda invocation.
5. Check DynamoDB for a new item.
6. Check the frontend Live Map for the new alert marker.

## Notes for handoff

- The backend and Lambda paths are now functioning with test data.
- The remaining work is mostly hardware validation and real GPS integration.
- If the GPS module uses a different data shape, keep the Lambda parser aligned with the payload instead of changing the database schema unnecessarily.
