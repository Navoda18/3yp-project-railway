import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export type Severity = "HIGH" | "MEDIUM" | "LOW";
export type AlertStatus = "pending" | "confirmed" | "ignored";

export interface CrackAlert {
  id: number;
  type: string;
  severity: Severity;
  location: string;
  km: number;
  time: string;
  timestamp: string;
  lat: number;
  lng: number;
  status: AlertStatus;
  confidence: number;
  irSensor: "Active" | "Inactive";
  description: string;
}

export interface RobotStatus {
  online: boolean;
  lat: number;
  lng: number;
  km: number;
  speed: number;
  battery: number;
}

interface AlertContextType {
  alerts: CrackAlert[];
  robotStatus: RobotStatus;
  updateStatus: (id: number, status: AlertStatus) => void;
  loading: boolean;
}

interface BackendCrackMessage {
  sensorId?: string;
  timestamp?: string;
  deviceId?: string;
  crackDetected?: boolean | string;
  crack_detected?: boolean | string;
  status?: string;
  latitude?: number | string;
  longitude?: number | string;
  locationValid?: boolean | string;
  satellites?: number | string;
  severity?: number | string;
}

interface BackendUltrasonicMessage {
  sensorId?: string;
  timestamp?: string;
  deviceId?: string;
  distanceCm?: number | string;
  obstacleDetected?: boolean | string;
  locationValid?: boolean | string;
  latitude?: number | string;
  longitude?: number | string;
  location?: {
    valid?: boolean | string;
    lat?: number | string;
    lng?: number | string;
    latitude?: number | string;
    longitude?: number | string;
  };
}

// ── Mock Data ──────────────────────────────────────────────
const mockAlerts: CrackAlert[] = [
  {
    id: 1,
    type: "Longitudinal Crack",
    severity: "HIGH",
    location: "Railway Track Section A",
    km: 143.5,
    time: "10:23 AM",
    timestamp: "2024-01-15T10:23:00",
    lat: 28.6155,
    lng: 77.2100,
    status: "pending",
    confidence: 94,
    irSensor: "Active",
    description: "Wide longitudinal crack detected across main rail track.",
  },
  {
    id: 2,
    type: "Transverse Crack",
    severity: "MEDIUM",
    location: "Railway Track Section B",
    km: 156.2,
    time: "11:45 AM",
    timestamp: "2024-01-15T11:45:00",
    lat: 28.6200,
    lng: 77.2200,
    status: "confirmed",
    confidence: 82,
    irSensor: "Active",
    description: "Transverse crack detected near joint section.",
  },
  {
    id: 3,
    type: "Surface Defect",
    severity: "LOW",
    location: "Railway Track Section C",
    km: 162.8,
    time: "02:10 PM",
    timestamp: "2024-01-15T14:10:00",
    lat: 28.6300,
    lng: 77.2300,
    status: "ignored",
    confidence: 67,
    irSensor: "Inactive",
    description: "Minor surface defect, monitoring required.",
  },
  {
    id: 4,
    type: "Longitudinal Crack",
    severity: "HIGH",
    location: "Railway Track Section D",
    km: 178.4,
    time: "03:55 PM",
    timestamp: "2024-01-15T15:55:00",
    lat: 28.6400,
    lng: 77.2400,
    status: "pending",
    confidence: 91,
    irSensor: "Active",
    description: "Critical crack detected near bridge approach.",
  },
];

const defaultRobot: RobotStatus = {
  online: true,
  lat: 28.6155,
  lng: 77.2100,
  km: 143,
  speed: 5.2,
  battery: 78,
};
// ──────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<CrackAlert[]>(mockAlerts);
  const [robotStatus, setRobotStatus] = useState<RobotStatus>(defaultRobot);
  const [loading] = useState(false);
  const nextAlertIdRef = useRef(mockAlerts.length + 1);

  // Mock update - just updates local state (no API call)
  const updateStatus = (id: number, status: AlertStatus) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    // TODO: Replace with Spring Boot API call:
    // await fetch(`http://localhost:8080/api/alerts/${id}/status`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ status }),
    // });
  };

  useEffect(() => {
    const mapSeverity = (severity?: number): Severity => {
      if (severity === undefined || Number.isNaN(severity)) {
        return "LOW";
      }
      if (severity >= 0.75) {
        return "HIGH";
      }
      if (severity >= 0.45) {
        return "MEDIUM";
      }
      return "LOW";
    };

    const normalizeSeverity = (severity?: number | string): Severity => {
      if (typeof severity === "string") {
        const upper = severity.toUpperCase();
        if (upper === "HIGH" || upper === "MEDIUM" || upper === "LOW") {
          return upper;
        }

        const parsed = Number(severity);
        return mapSeverity(Number.isNaN(parsed) ? undefined : parsed);
      }

      return mapSeverity(severity);
    };

    const toNumber = (value?: number | string): number | undefined => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      const parsed = typeof value === "string" ? Number(value) : value;
      return Number.isNaN(parsed) ? undefined : parsed;
    };

    const toBoolean = (value?: boolean | string): boolean => {
      if (typeof value === "string") {
        return value.toLowerCase() === "true";
      }

      return Boolean(value);
    };

    const toIso = (value?: string): string => {
      if (!value) {
        return new Date().toISOString();
      }
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
    };

    const toUiAlert = (msg: BackendCrackMessage): CrackAlert => {
      const timestampIso = toIso(msg.timestamp);
      const date = new Date(timestampIso);
      const crackDetected = toBoolean(msg.crackDetected ?? msg.crack_detected);
      const validLocation = toBoolean(msg.locationValid);
      const latitude = toNumber(msg.latitude);
      const longitude = toNumber(msg.longitude);
      const normalizedSeverity = normalizeSeverity(msg.severity);
      const confidence =
        typeof msg.severity === "number"
          ? Math.max(0, Math.min(100, Math.round(msg.severity * 100)))
          : normalizedSeverity === "HIGH"
            ? 95
            : normalizedSeverity === "MEDIUM"
              ? 75
              : 45;
      const lat = validLocation && latitude !== undefined ? latitude : defaultRobot.lat;
      const lng = validLocation && longitude !== undefined ? longitude : defaultRobot.lng;

      return {
        id: nextAlertIdRef.current++,
        type: crackDetected ? "Crack Detected" : "Normal Reading",
        severity: normalizedSeverity,
        location: validLocation ? `${lat.toFixed(4)}°, ${lng.toFixed(4)}°` : "GPS not fixed",
        km: robotStatus.km,
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: timestampIso,
        lat,
        lng,
        status: crackDetected ? "pending" : "ignored",
        confidence,
        irSensor: crackDetected ? "Active" : "Inactive",
        description: msg.status ?? (crackDetected ? "Crack event received from backend" : "Normal telemetry received"),
      };
    };

    const toUltrasonicAlert = (msg: BackendUltrasonicMessage): CrackAlert | null => {
      const obstacleDetected = toBoolean(msg.obstacleDetected);
      if (!obstacleDetected) {
        return null;
      }

      const timestampIso = toIso(msg.timestamp);
      const date = new Date(timestampIso);
      const distanceCm = toNumber(msg.distanceCm) ?? 0;

      const locationObject = msg.location;
      const latitude =
        toNumber(locationObject?.lat) ??
        toNumber(locationObject?.latitude) ??
        toNumber(msg.latitude);
      const longitude =
        toNumber(locationObject?.lng) ??
        toNumber(locationObject?.longitude) ??
        toNumber(msg.longitude);

      const locationValid =
        toBoolean(locationObject?.valid) ||
        toBoolean(msg.locationValid);

      const lat = locationValid && latitude !== undefined ? latitude : robotStatus.lat;
      const lng = locationValid && longitude !== undefined ? longitude : robotStatus.lng;

      let severity: Severity = "LOW";
      if (distanceCm <= 25) {
        severity = "HIGH";
      } else if (distanceCm <= 50) {
        severity = "MEDIUM";
      }

      const confidence = severity === "HIGH" ? 92 : severity === "MEDIUM" ? 80 : 65;

      return {
        id: nextAlertIdRef.current++,
        type: "Ultrasonic Obstacle",
        severity,
        location: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
        km: robotStatus.km,
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timestamp: timestampIso,
        lat,
        lng,
        status: "pending",
        confidence,
        irSensor: "Inactive",
        description: `Obstacle detected by ${msg.sensorId ?? "ultrasonic sensor"} at ${distanceCm.toFixed(1)} cm`,
      };
    };

    const wsBase = import.meta.env.VITE_BACKEND_WS_URL ?? "http://localhost:8080/raid-websocket";

    const client = new Client({
      webSocketFactory: () => new SockJS(wsBase),
      reconnectDelay: 5000,
      debug: () => {
        // Keep websocket logging quiet in production builds.
      },
    });

    client.onConnect = () => {
      client.subscribe("/topic/cracks", (frame) => {
        try {
          const payload: BackendCrackMessage = JSON.parse(frame.body);

          setAlerts((prev) => [toUiAlert(payload), ...prev].slice(0, 100));

          if (payload.locationValid && payload.latitude !== undefined && payload.longitude !== undefined) {
            setRobotStatus((prev) => ({
              ...prev,
              online: true,
              lat: Number(payload.latitude),
              lng: Number(payload.longitude),
            }));
          }
        } catch {
          // Ignore malformed payloads and keep stream alive.
        }
      });

      client.subscribe("/topic/ultrasonic", (frame) => {
        try {
          const payload: BackendUltrasonicMessage = JSON.parse(frame.body);
          const ultrasonicAlert = toUltrasonicAlert(payload);

          if (!ultrasonicAlert) {
            return;
          }

          setAlerts((prev) => [ultrasonicAlert, ...prev].slice(0, 100));

          setRobotStatus((prev) => ({
            ...prev,
            online: true,
            lat: ultrasonicAlert.lat,
            lng: ultrasonicAlert.lng,
          }));
        } catch {
          // Ignore malformed payloads and keep stream alive.
        }
      });
    };

    client.onStompError = (frame) => {
      console.warn("WebSocket connection failed, starting mock ultrasonic alerts generator");
      
      // Fallback: Generate mock ultrasonic alerts when backend is unavailable
      const mockUltrasonicInterval = setInterval(() => {
        const distances = [35.2, 42.5, 48.3, 65.8, 72.1, 89.5, 95.0, 120.0, 150.0];
        const randomDistance = distances[Math.floor(Math.random() * distances.length)];
        
        const mockUltrasonicMessage: BackendUltrasonicMessage = {
          sensorId: "ULTRA_FRONT",
          deviceId: "esp-001",
          timestamp: new Date().toISOString(),
          distanceCm: randomDistance,
          obstacleDetected: randomDistance <= 50,
        };
        
        const ultrasonicAlert = toUltrasonicAlert(mockUltrasonicMessage);
        if (ultrasonicAlert) {
          setAlerts((prev) => [ultrasonicAlert, ...prev].slice(0, 100));
          setRobotStatus((prev) => ({
            ...prev,
            online: true,
            lat: ultrasonicAlert.lat,
            lng: ultrasonicAlert.lng,
          }));
        }
      }, 5000); // Simulate 5-second publishing interval
      
      // Store interval ID for cleanup
      (client as any)._mockUltrasonicInterval = mockUltrasonicInterval;
    };

    client.activate();

    return () => {
      // Clear mock interval if it was created
      if ((client as any)._mockUltrasonicInterval) {
        clearInterval((client as any)._mockUltrasonicInterval);
      }
      client.deactivate();
    };
  }, [robotStatus.km]);

  return (
    <AlertContext.Provider value={{ alerts, robotStatus, updateStatus, loading }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertProvider");
  return ctx;
};