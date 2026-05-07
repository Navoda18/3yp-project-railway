import socket
import json

# ================= Configuration =================
# The entry point for the Producer (Robot)
LB_IP = '127.0.0.1'
LB_PORT = 7000

# The addresses of your simulated Backends (Workers)
WORKER_A = ('127.0.0.1', 8001)
WORKER_B = ('127.0.0.1', 8002)
WORKER_POOL = [WORKER_A, WORKER_B]

# ================= Setup Sockets =================
# We use one socket to listen and one to forward
receiver_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
receiver_sock.bind((LB_IP, LB_PORT))

sender_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

print(f"⚖️  [LOAD BALANCER] Online and listening on port {LB_PORT}")
print(f"🔗 Managed Worker Pool: {WORKER_POOL}")
print("-" * 50)

# Pointer to track whose turn it is (Round-Robin)
current_worker_index = 0

try:
    while True:
        # 1. Receive data from the Producer
        data, addr = receiver_sock.recvfrom(4096) 
        
        # Parse briefly just to show the user what's happening
        payload = json.loads(data.decode('utf-8'))
        msg_id = payload.get("id", "Unknown")
        status = payload.get("status", "N/A")
        
        # 2. Pick the next worker (Round-Robin Logic)
        # 0 -> 1 -> 0 -> 1...
        target_worker = WORKER_POOL[current_worker_index]
        
        # 3. Forward the exact payload to that worker
        sender_sock.sendto(data, target_worker)
        
        # 4. Console Log
        print(f" Received {status} (ID: {msg_id})")
        print(f"     Routing to Worker @ Port {target_worker[1]}")
        
        # 5. Increment index for the next message
        current_worker_index = (current_worker_index + 1) % len(WORKER_POOL)

except KeyboardInterrupt:
    print("\n Load Balancer shutting down.")
finally:
    receiver_sock.close()
    sender_sock.close()