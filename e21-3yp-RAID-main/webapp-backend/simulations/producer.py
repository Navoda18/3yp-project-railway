import socket
import json
import time
import random
from datetime import datetime

# ================= Configuration =================
LB_ADDR = ('127.0.0.1', 7000)
DEVICE_ID = "esp-001"
# Starting coordinates (Kandy/Peradeniya area)
BASE_LAT = 7.2525
BASE_LON = 80.5925

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

print(f"🚀 [ROBOT SIMULATOR] Started: {DEVICE_ID}")
print(f"📡 Sending multi-sensor telemetry to Load Balancer at {LB_ADDR}...")

count = 0
start_time = time.time()

try:
    while True:
        count += 1
        uptime = int(time.time() - start_time)
        
        # 1. SIMULATE SENSOR LOGIC
        # 10% chance of detecting a crack
        crack_found = random.random() < 0.10 
        
        # If crack is found, IR goes LOW (0), severity goes up
        ir_value = 0 if crack_found else 1
        severity = round(random.uniform(0.85, 0.98), 2) if crack_found else 0.10
        status = "CRITICAL_DEFECT" if crack_found else "NOMINAL_HEARTBEAT"
        
        # 2. SIMULATE MOVEMENT (Small increments to GPS)
        current_lat = BASE_LAT + (count * 0.0001)
        current_lon = BASE_LON + (count * 0.00005)

        # 3. CONSTRUCT THE FULL PAYLOAD (Matches your ESP32 C++ structure)
        payload = {
            "sensorId": "IR_Bottom",
            "deviceId": DEVICE_ID,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "crack_detected": crack_found,
            "status": status,
            "severity": severity,
            "irSensor": ir_value,
            "uptime": uptime,
            "location": {
                "latitude": current_lat,
                "longitude": current_lon,
                "valid": True,
                "satellites": random.randint(8, 12)
            },
            "image_url": f"https://railway-system-photos.s3.amazonaws.com/detect_{count}.jpg"
        }
        
        # 4. SEND DATA
        message = json.dumps(payload).encode('utf-8')
        sock.sendto(message, LB_ADDR)
        
        # 5. LOG TO TERMINAL
        icon = "🚨" if crack_found else "💚"
        print(f"{icon} [{status}] Lat: {current_lat:.5f}, Lon: {current_lon:.5f}, IR: {ir_value}")
        
        # Send data every 2 seconds for a realistic flow
        time.sleep(2)

except KeyboardInterrupt:
    print("\n🛑 Robot Simulation stopped.")