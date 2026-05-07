# import os
# import sys
# import time
# import json
# import random
# from datetime import datetime
# from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

# # ----------------- Certificate Check -----------------
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# ROOT_CA = os.path.join(BASE_DIR, "AmazonRootCA1.pem")
# CERT_FILE = os.path.join(BASE_DIR, "certificate.pem.crt")
# KEY_FILE = os.path.join(BASE_DIR, "private.pem.key")

# for path in (ROOT_CA, CERT_FILE, KEY_FILE):
#     if not os.path.isfile(path):
#         print(f"Error: certificate/key file not found at {path}")
#         sys.exit(1)

# print("All certificate files found!")

# # ----------------- MQTT Setup -----------------
# IOT_ENDPOINT = "a141eqbs4ue48l-ats.iot.eu-north-1.amazonaws.com"  # replace this
# CLIENT_ID = "esp32"
# DEVICE_ID = "esp-001"
# # Upgraded to the double wildcard format we set in the AWS Rule!
# TOPIC = f"device/{DEVICE_ID}/IR_Bottom"

# client = AWSIoTMQTTClient(CLIENT_ID)
# client.configureEndpoint(IOT_ENDPOINT, 8883)
# client.configureCredentials(ROOT_CA, KEY_FILE, CERT_FILE)
# client.configureOfflinePublishQueueing(-1)
# client.configureDrainingFrequency(2)
# client.configureConnectDisconnectTimeout(10)
# client.configureMQTTOperationTimeout(20)

# try:
#     client.connect()
#     print("Connected to AWS IoT!")
# except Exception as e:
#     import traceback
#     traceback.print_exc()
#     print(f"Failed to connect: {e}")
#     sys.exit(1)

# # ----------------- The Hybrid Heartbeat Architecture -----------------
# count = 0
# HEARTBEAT_INTERVAL = 30  # Seconds between routine check-ins

# # Initialize timer so it forces a heartbeat immediately on boot
# last_heartbeat_time = time.time() - HEARTBEAT_INTERVAL 

# print("\n🚀 Starting Edge Filtering Node...")
# print(f"Scanning track continuously. Heartbeat interval: {HEARTBEAT_INTERVAL}s\n")

# try:
#     while True:
#         # 1. The Fast Loop: Simulate the ESP32 checking the IR sensor incredibly fast
#         # (We use a 5% chance to simulate a rare crack on the track)
#         is_crack_detected = random.random() > 0.95 
#         current_time = time.time()

#         # SCENARIO A: The Interrupt (Immediate Critical Alert)
#         if is_crack_detected:
#             payload = {
#                 "deviceId": DEVICE_ID,
#                 "timestamp": datetime.now().isoformat(),
#                 "sensor": "IR_Bottom",
#                 "crack_detected": True,
#                 "status": "CRITICAL_DEFECT",
#                 "uptime": count
#             }
#             try:
#                 client.publish(TOPIC, json.dumps(payload), 1)
#                 print(f"[{time.strftime('%H:%M:%S')}] 🚨 CRITICAL ALERT PUBLISHED: {payload}")
                
#                 # Reset the heartbeat timer! We just proved the robot is alive.
#                 last_heartbeat_time = current_time
#             except Exception as e:
#                 print(f"Failed to publish alert: {e}")

#         # SCENARIO B: The Routine Heartbeat (Only runs if 30 seconds have passed)
#         elif (current_time - last_heartbeat_time) >= HEARTBEAT_INTERVAL:
#             payload = {
#                 "deviceId": DEVICE_ID,
#                 "timestamp": datetime.now().isoformat(),
#                 "sensor": "IR_Bottom",
#                 "crack_detected": False,
#                 "status": "NOMINAL_HEARTBEAT",
#                 "battery": random.randint(70, 100), # Dummy hardware data
#                 "speed": random.randint(10, 15),
#                 "uptime": count
#             }
#             try:
#                 client.publish(TOPIC, json.dumps(payload), 1)
#                 print(f"[{time.strftime('%H:%M:%S')}] 💚 Heartbeat Check-in: {payload}")
                
#                 last_heartbeat_time = current_time
#             except Exception as e:
#                 print(f"Failed to publish heartbeat: {e}")

#         count += 1
        
#         # Sleep for just 1 second. 
#         # This keeps the loop fast enough to catch cracks instantly,
#         # but prevents the Python script from maxing out your computer's CPU.
#         time.sleep(1)

# except KeyboardInterrupt:
#     print("\nStopped by user")

# finally:
#     client.disconnect()
#     print("Disconnected from AWS IoT")



import os
import sys
import time
import json
import random
from datetime import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

# ----------------- Certificate Check -----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_CA = os.path.join(BASE_DIR, "AmazonRootCA1.pem")
CERT_FILE = os.path.join(BASE_DIR, "certificate.pem.crt")
KEY_FILE = os.path.join(BASE_DIR, "private.pem.key")

for path in (ROOT_CA, CERT_FILE, KEY_FILE):
    if not os.path.isfile(path):
        print(f"Error: certificate/key file not found at {path}")
        sys.exit(1)

print("All certificate files found!")

# ----------------- MQTT Setup -----------------
IOT_ENDPOINT = "a141eqbs4ue48l-ats.iot.eu-north-1.amazonaws.com"
CLIENT_ID = "esp32"
DEVICE_ID = "esp-001"
SENSOR_ID = "IR_Bottom_01"

TOPIC = f"device/{DEVICE_ID}/IR_Bottom"

client = AWSIoTMQTTClient(CLIENT_ID)
client.configureEndpoint(IOT_ENDPOINT, 8883)
client.configureCredentials(ROOT_CA, KEY_FILE, CERT_FILE)
client.configureOfflinePublishQueueing(-1)
client.configureDrainingFrequency(2)
client.configureConnectDisconnectTimeout(10)
client.configureMQTTOperationTimeout(20)

client.connect()
print("Connected to AWS IoT!")

# ----------------- Static GPS (Peradeniya) -----------------
LOCATION = {
    "latitude": 7.2569,
    "longitude": 80.5975
}

# ----------------- Dummy S3 Image URL -----------------
def generate_image_url():
    # Simulate uploaded image URL
    return f"https://your-bucket-name.s3.amazonaws.com/crack_{int(time.time())}.jpg"

# ----------------- Severity Logic -----------------
def get_severity():
    return random.choice(["LOW", "MEDIUM", "HIGH"])

# ----------------- Main Loop -----------------
count = 0
HEARTBEAT_INTERVAL = 30
last_heartbeat_time = time.time() - HEARTBEAT_INTERVAL

print("\n🚀 Starting Edge Filtering Node...\n")

try:
    while True:
        is_crack_detected = random.random() > 0.95
        current_time = time.time()

        # 🚨 CRITICAL EVENT
        if is_crack_detected:
            payload = {
                "sensorId": SENSOR_ID,
                "deviceId": DEVICE_ID,
                "timestamp": datetime.now().isoformat(),
                "crackDetected": True,
                "status": "CRITICAL_DEFECT",
                "severity": get_severity(),
                "location": LOCATION,
                "imageurl": generate_image_url(),
                "uptime": count
            }

            client.publish(TOPIC, json.dumps(payload), 1)
            print(f"[{time.strftime('%H:%M:%S')}] 🚨 ALERT: {payload}")

            last_heartbeat_time = current_time

        # 💚 HEARTBEAT
        elif (current_time - last_heartbeat_time) >= HEARTBEAT_INTERVAL:
            payload = {
                "sensorId": SENSOR_ID,
                "deviceId": DEVICE_ID,
                "timestamp": datetime.now().isoformat(),
                "crackDetected": False,
                "status": "NOMINAL_HEARTBEAT",
                "battery": random.randint(70, 100),
                "speed": random.randint(10, 15),
                "uptime": count
            }

            client.publish(TOPIC, json.dumps(payload), 1)
            print(f"[{time.strftime('%H:%M:%S')}] 💚 Heartbeat")

            last_heartbeat_time = current_time

        count += 1
        time.sleep(1)

except KeyboardInterrupt:
    print("\nStopped by user")

finally:
    client.disconnect()
    print("Disconnected from AWS IoT")