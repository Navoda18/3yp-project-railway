import socket
import sys

if len(sys.argv) < 2:
    print("Usage: python worker.py [PORT]")
    sys.exit()

PORT = int(sys.argv[1])
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('127.0.0.1', PORT))

print(f"👷 Worker active on port {PORT}. Waiting for data...")

try:
    while True:
        data, addr = sock.recvfrom(1024)
        print(f"📥 Received and Processed: {data.decode('utf-8')}")
except KeyboardInterrupt:
    print(f"Worker on {PORT} stopped.")