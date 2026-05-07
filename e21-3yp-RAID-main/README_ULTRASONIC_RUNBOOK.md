# Ultrasonic Workflow Runbook

This guide contains the exact commands to run firmware, backend, and frontend for the ultrasonic flow.

## 1) Prerequisites

- Java 17+ (project currently runs on Java 21 in your logs)
- Maven wrapper (already in `webapp-backend/`)
- Node.js + npm
- PlatformIO CLI (or VS Code PlatformIO extension)
- AWS resources:
  - DynamoDB table: `ultrasonic_sensor_logs`
  - AWS IoT Core endpoint: `a141eqbs4ue48l-ats.iot.eu-north-1.amazonaws.com`

## 2) Firmware (ESP32) - Build/Upload/Monitor

From repo root:

```powershell
pio run
pio run -t upload
pio device monitor -b 115200
```

Notes:
- Board config is in `platformio.ini` (`esp32-s3-devkitc-1`, 115200 baud).
- Firmware publishes ultrasonic payload to topic `railway/ultrasonic` every ~5 seconds.

## 3) Backend (Spring Boot) - Start with AWS credentials

Open **PowerShell** and run from repo root:

```powershell
Set-Location .\webapp-backend

# Use REAL keys (do not use placeholders)
$env:AWS_ACCESS_KEY_ID="<YOUR_ACCESS_KEY_ID>"
$env:AWS_SECRET_ACCESS_KEY="<YOUR_SECRET_ACCESS_KEY>"

# Optional sanity check
Write-Host "AK set?" ([string]::IsNullOrWhiteSpace($env:AWS_ACCESS_KEY_ID) -eq $false)
Write-Host "SK set?" ([string]::IsNullOrWhiteSpace($env:AWS_SECRET_ACCESS_KEY) -eq $false)

.\mvnw.cmd "-Dspring-boot.run.arguments=--aws.region=eu-north-1 --aws.accessKeyId=$env:AWS_ACCESS_KEY_ID --aws.secretKey=$env:AWS_SECRET_ACCESS_KEY --aws.dynamodb.tableName=ultrasonic_sensor_logs --aws.iot.broker.url=ssl://a141eqbs4ue48l-ats.iot.eu-north-1.amazonaws.com:8883 --aws.iot.broker.clientId=backend-test-client --aws.iot.topic.filter=railway/#" spring-boot:run
```

Expected startup lines:
- `Tomcat started on port 8080`
- `started bean 'inbound'` (MQTT adapter)
- `Started WebappBackendApplication`

If port 8080 is busy:

```powershell
$pid8080 = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($pid8080) { Stop-Process -Id $pid8080 -Force }
```

## 4) Frontend (Vite React)

Open another terminal from repo root:

```powershell
Set-Location .\webapp
npm install
npm run dev
```

Frontend runs on Vite default URL (usually `http://localhost:5173`).

## 5) Verify Ultrasonic End-to-End

### A. Check backend REST endpoint

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/ultrasonic/esp-001/ULTRA_FRONT
```

- `200 OK` + JSON means backend API is reachable.
- Empty array `[]` is normal before first message is stored.

### B. Check firmware publish

In serial monitor, confirm logs like:
- `[Publish] Success! Topic: railway/ultrasonic | Payload: ...`

### C. Check DynamoDB write

Open table `ultrasonic_sensor_logs` in AWS Console and verify new items appear with:
- `SensorID` = `ULTRA_FRONT`
- `timestamp`
- `distanceCm`
- `obstacleDetected`

### D. Check frontend live updates

Open frontend and verify ultrasonic data appears/updates in UI.

## 6) Quick Troubleshooting

### Error: `Access key ID cannot be blank`
- Credentials are not set in the same shell session as Maven run.
- Re-set `$env:AWS_ACCESS_KEY_ID` and `$env:AWS_SECRET_ACCESS_KEY` in that exact terminal.

### Error: `Port 8080 already in use`
- Kill process using 8080 (command above) or run backend on a different port.

### Error: `Unable to connect to localhost:8080`
- Backend is not running or crashed during startup.

### MQTT timeout to AWS IoT
- Check internet/firewall for outbound 8883
- Verify IoT endpoint and cert/keystore setup
- Verify IoT policy allows connect/subscribe/receive for topic `railway/#`

## 7) Stop Services

- Frontend: `Ctrl + C`
- Backend: `Ctrl + C`
- Serial monitor: `Ctrl + C`
