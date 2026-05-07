"""
AWS Lambda — crack_handler.py  (cold path)
==========================================
Triggered by: AWS IoT Rules Engine
  Rule SQL:   SELECT * FROM 'railway/cracks' WHERE crackDetected = true
  Action:     Lambda invocation

Writes to DynamoDB using attribute names that match IRSensorDataDTO field names
exactly, so CrackLocationQueryService can read them back without remapping.

DynamoDB table setup:
  Table name:     raid-crack-detections   (set TABLE_NAME env var)
  Partition key:  sensorId    (String)
  Sort key:       timestamp   (String, ISO-8601)
  Billing mode:   PAY_PER_REQUEST

Expected event payload (from ESP32 via MQTT):
{
  "sensorId":      "esp32_1",
  "deviceId":      "raid-robot-01",
  "crackDetected": true,
  "status":        "CRACK",
  "severity":      0.82,
  "timestamp":     "2025-03-15T08:22:11Z",
  "location": {
    "latitude":   7.2906,
    "longitude":  80.6337,
    "valid":      true,
    "satellites": 6
  }
}
"""

import json
import os
import uuid
import boto3
from datetime import datetime, timezone
from decimal import Decimal

dynamodb  = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME', 'raid-crack-detections')
table     = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    print(f"[LAMBDA] Received: {json.dumps(event)}")

    try:
        # ── Extract fields — names match IRSensorDataDTO exactly ─────────────
        sensor_id     = event.get('sensorId') or event.get('SensorID') or 'unknown'
        device_id     = event.get('deviceId',      'unknown')
        crack_detected = event.get('crackDetected', event.get('crack_detected', False))
        status        = event.get('status',         'CRACK')
        severity      = Decimal(str(event.get('severity', 0.0)))
        gps_ts        = event.get('timestamp',      '')

        location      = event.get('location', {})
        lat           = Decimal(str(location.get('lat', event.get('lat', 0.0))))
        lng           = Decimal(str(location.get('lng', event.get('lng', 0.0))))
        latitude      = Decimal(str(location.get('latitude', event.get('latitude', lat))))
        longitude     = Decimal(str(location.get('longitude', event.get('longitude', lng))))
        loc_valid     = bool(location.get('valid', event.get('locationValid', False)))
        satellites    = int(location.get('satellites', event.get('satellites', 0)))

        if not crack_detected:
            # IoT Rules WHERE clause should prevent this, but guard anyway
            print(f"[LAMBDA] Skipping — crackDetected is false for {sensor_id}")
            return {'statusCode': 200, 'body': 'skipped'}

        if not loc_valid:
            print(f"[GPS] WARNING: No GPS fix for {sensor_id} — storing (0, 0)")

        # Use GPS timestamp if present, else server time
        timestamp = gps_ts if gps_ts else datetime.now(timezone.utc).isoformat()

        # ── Write to DynamoDB ─────────────────────────────────────────────────
        # Attribute names match IRSensorDataDTO fields so Spring Boot can
        # deserialise DynamoDB items back into IRSensorDataDTO without remapping.
        item = {
            'sensorId':      sensor_id,      # Partition key — matches DTO
            'timestamp':     timestamp,       # Sort key      — matches DTO
            'id':            str(uuid.uuid4()),
            'deviceId':      device_id,       # matches DTO
            'crackDetected': crack_detected,  # matches DTO
            'status':        status,          # matches DTO
            'severity':      severity,        # matches DTO (new field)
            'lat':           lat,
            'lng':           lng,
            'latitude':      latitude,        # matches DTO location.latitude
            'longitude':     longitude,       # matches DTO location.longitude
            'locationValid': loc_valid,       # used by Spring query filter
            'satellites':    satellites,      # matches DTO location.satellites
            'receivedAt':    datetime.now(timezone.utc).isoformat(),
        }

        table.put_item(Item=item)

        print(f"[LAMBDA] Saved — sensorId={sensor_id} "
              f"lat={latitude} lng={longitude} severity={severity}")

        return {'statusCode': 200, 'body': 'saved'}

    except Exception as e:
        print(f"[LAMBDA] ERROR: {e}")
        raise   # re-raise so Lambda marks invocation failed → triggers retry
