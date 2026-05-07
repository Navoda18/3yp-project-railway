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

export const robotStatus: RobotStatus = {
  online: true,
  lat: 28.6155,
  lng: 77.2100,
  km: 143.0,
  speed: 5.2,
  battery: 78,
};

export const crackAlerts: CrackAlert[] = [
  {
    id: 1,
    type: "Crack Detected",
    severity: "HIGH",
    location: "Track Marker KM 142.5",
    km: 142.5,
    time: "2 minutes ago",
    timestamp: "14:32",
    lat: 28.6139,
    lng: 77.2090,
    status: "pending",
    confidence: 92,
    irSensor: "Active",
    description:
      "Significant transverse crack detected on the rail head surface.",
  },
  {
    id: 2,
    type: "Crack Detected",
    severity: "MEDIUM",
    location: "Track Marker KM 141.8",
    km: 141.8,
    time: "15 minutes ago",
    timestamp: "14:15",
    lat: 28.6120,
    lng: 77.2080,
    status: "confirmed",
    confidence: 74,
    irSensor: "Active",
    description:
      "Surface-level hairline crack detected on the rail web.",
  },
  {
    id: 3,
    type: "Crack Detected",
    severity: "LOW",
    location: "Track Marker KM 140.2",
    km: 140.2,
    time: "1 hour ago",
    timestamp: "13:30",
    lat: 28.6100,
    lng: 77.2060,
    status: "ignored",
    confidence: 58,
    irSensor: "Active",
    description:
      "Minor surface irregularity detected on rail surface.",
  },
  {
    id: 4,
    type: "Crack Detected",
    severity: "HIGH",
    location: "Track Marker KM 139.0",
    km: 139.0,
    time: "2 hours ago",
    timestamp: "12:45",
    lat: 28.6080,
    lng: 77.2040,
    status: "confirmed",
    confidence: 95,
    irSensor: "Active",
    description:
      "Severe longitudinal crack confirmed on rail foot.",
  },
  {
    id: 5,
    type: "Crack Detected",
    severity: "MEDIUM",
    location: "Track Marker KM 138.5",
    km: 138.5,
    time: "3 hours ago",
    timestamp: "12:10",
    lat: 28.6060,
    lng: 77.2020,
    status: "ignored",
    confidence: 45,
    irSensor: "Active",
    description:
      "Sensor reading indicated possible crack on rail web.",
  },
  {
    id: 6,
    type: "Crack Detected",
    severity: "HIGH",
    location: "Track Marker KM 137.2",
    km: 137.2,
    time: "4 hours ago",
    timestamp: "11:20",
    lat: 28.6040,
    lng: 77.2000,
    status: "confirmed",
    confidence: 89,
    irSensor: "Active",
    description:
      "Rail head shelling detected with visible crack propagation.",
  },
  {
    id: 7,
    type: "Crack Detected",
    severity: "LOW",
    location: "Track Marker KM 136.0",
    km: 136.0,
    time: "5 hours ago",
    timestamp: "10:05",
    lat: 28.6020,
    lng: 77.1980,
    status: "ignored",
    confidence: 38,
    irSensor: "Inactive",
    description:
      "Weak signal detected on sensor array.",
  },
];

// ============= Mock Ultrasonic Sensor Data =============
export interface UltrasonicEvent {
  sensorId: string;
  deviceId: string;
  timestamp: string;
  distanceCm: number;
  obstacleDetected: boolean;
}

export const mockUltrasonicData: UltrasonicEvent[] = [
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:35:20Z",
    distanceCm: 42.5,
    obstacleDetected: true,
  },
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:35:15Z",
    distanceCm: 38.2,
    obstacleDetected: true,
  },
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:35:10Z",
    distanceCm: 65.8,
    obstacleDetected: false,
  },
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:35:05Z",
    distanceCm: 72.3,
    obstacleDetected: false,
  },
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:35:00Z",
    distanceCm: 45.6,
    obstacleDetected: true,
  },
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:34:55Z",
    distanceCm: 89.2,
    obstacleDetected: false,
  },
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:34:50Z",
    distanceCm: 95.0,
    obstacleDetected: false,
  },
  {
    sensorId: "ULTRA_FRONT",
    deviceId: "esp-001",
    timestamp: "2024-04-24T14:34:45Z",
    distanceCm: 120.5,
    obstacleDetected: false,
  },
];

export const getAlertById = (id: number): CrackAlert | undefined =>
  crackAlerts.find((a) => a.id === id);

export const getPendingAlerts = () => crackAlerts.filter((a) => a.status === "pending");
export const getConfirmedAlerts = () => crackAlerts.filter((a) => a.status === "confirmed");
export const getIgnoredAlerts = () => crackAlerts.filter((a) => a.status === "ignored");

export const severityColor = {
  HIGH: { badge: "bg-destructive text-destructive-foreground", border: "border-l-destructive", dot: "bg-destructive" },
  MEDIUM: { badge: "bg-warning text-warning-foreground", border: "border-l-warning", dot: "bg-warning" },
  LOW: { badge: "bg-accent text-accent-foreground", border: "border-l-accent", dot: "bg-accent" },
};

export const statusColor = {
  pending: { badge: "bg-warning/15 text-warning", label: "Pending Review" },
  confirmed: { badge: "bg-success/15 text-success", label: "Confirmed" },
  ignored: { badge: "bg-muted text-muted-foreground", label: "Ignored" },
};
