# import cv2
# import requests
# import time
# import paho.mqtt.client as mqtt
# import ssl
# import json
# import datetime

# # ===== CONFIGURATION =====
# BOT_TOKEN = "8453673141:AAHxgehOW__-7LuVvlmm7xqpEcW9zXRj3QA"
# CHAT_ID = "1681826822"  # Use @userinfobot to get your ID
# # Replace with your AWS EC2/Beanstalk URL or 'http://localhost:8080' for local testing
# BACKEND_API = "http://localhost:8080/api/esp32cam/capture"

# # --- AWS IoT CONFIG ---
# AWS_ENDPOINT = "a141eqbs4ue48l-ats.iot.eu-north-1.amazonaws.com"  # Replace with your AWS IoT endpoint
# IOT_TOPIC = "device/camera/data"  # Matches the '+' wildcard in her rule
# CA_CERT = "AmazonRootCA1.pem"
# CLIENT_CERT = "77f60599d881e6da7cc290717b0ad5b857f1cfef22aa857ab7f0a73800a723d2-certificate.pem.crt"
# CLIENT_KEY = "77f60599d881e6da7cc290717b0ad5b857f1cfef22aa857ab7f0a73800a723d2-private.pem.key"

# def send_camera_update(telegram_url):
#     """Send image data to AWS IoT Core"""
#     client = mqtt.Client(client_id="esp32_simulator")
    
#     # Configure TLS/SSL with certificate files
#     client.tls_set(ca_certs=CA_CERT, 
#                    certfile=CLIENT_CERT, 
#                    keyfile=CLIENT_KEY, 
#                    tls_version=ssl.PROTOCOL_TLSv1_2)

#     client.connect(AWS_ENDPOINT, 8883, 60)
    
#     # Ensure connection is established
#     client.loop_start()
#     time.sleep(2)  # Give it time to shake hands with AWS
    
#     topic = "device/camera/data"
    
#     payload = {
#         "SensorID": "ESP32_CAM_TEST",  # Clear name so you find it easily
#         "deviceId": "esp-001",         # Matches the robot ID
#         "timestamp": datetime.datetime.utcnow().isoformat(),
#         "crack_detected": True,        # We pretend the IR sensor saw it
#         "imageUrl": telegram_url,      # Your Telegram link
#         "status": "CRACK FOUND"
#     }
    
#     result = client.publish(topic, json.dumps(payload))
#     result.wait_for_publish()  # Forces the script to wait for AWS to say "I got it"
#     print("Confirmed by AWS!")
#     client.loop_stop()
#     client.disconnect()

# def run_simulator():
#     # 1. Initialize  Camera
#     cam = cv2.VideoCapture(700)
#     print("Robot Simulator Active. Press SPACE to simulate a crack detection.")

#     while True:
#         ret, frame = cam.read()
#         if not ret:
#             break
        
#         cv2.imshow("Robot Camera View", frame)
        
#         k = cv2.waitKey(1)
#         if k % 256 == 32:  # SPACE pressed
#             print("CRACK DETECTED! Capturing...")
#             img_name = "crack_capture.jpg"
#             cv2.imwrite(img_name, frame)
            
#             # 2. Upload to Telegram
#             print("Uploading to Telegram...")
#             url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendPhoto"
#             with open(img_name, 'rb') as f:
#                 payload = {'chat_id': CHAT_ID}
#                 files = {'photo': f}
#                 tg_res = requests.post(url, data=payload, files=files).json()

#             if tg_res.get('ok'):
#                 # Extract the file_id (Telegram gives multiple sizes, we pick the last one/largest)
#                 file_id = tg_res['result']['photo'][-1]['file_id']
#                 print(f"Telegram Upload Success! File ID: {file_id}")

#                 # 3. Get the actual file path from Telegram
#                 path_res = requests.get(f"https://api.telegram.org/bot{BOT_TOKEN}/getFile?file_id={file_id}").json()
#                 file_path = path_res['result']['file_path']
#                 final_image_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path}"

#                 # 4. Send to AWS IoT Core via MQTT
#                 print("Publishing crack detection to AWS IoT Core...")
#                 try:
#                     send_camera_update(final_image_url)
#                 except Exception as e:
#                     print(f"Failed to send to AWS IoT: {e}")

#         elif k % 256 == 27:  # ESC pressed
#             break

#     cam.release()
#     cv2.destroyAllWindows()

# if __name__ == "__main__":
#     run_simulator()