import { useState, useEffect } from 'react';
import { CrackEvent } from './useTelemetry';

/**
 * Generates realistic mock telemetry data for demonstration purposes.
 * Simulates a continuous stream of crack detections with varying severity.
 */
export function useMockTelemetry(deviceId: string, sensorId: string) {
  const [liveCracks, setLiveCracks] = useState<CrackEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    setIsConnected(true);
    
    // Generate initial mock data
    const initialCracks = generateMockCracks(5, deviceId);
    setLiveCracks(initialCracks);

    // Simulate new crack detections every 5-15 seconds
    const interval = setInterval(() => {
      const newCrack = generateSingleMockCrack(deviceId);
      setLiveCracks(prev => [newCrack, ...prev].slice(0, 100));
    }, Math.random() * 10000 + 5000); // 5-15 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [deviceId, sensorId]);

  return { liveCracks, isConnected };
}

/**
 * Generates a batch of mock crack events for initial load
 */
function generateMockCracks(count: number, deviceId: string): CrackEvent[] {
  const cracks: CrackEvent[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    cracks.push(generateSingleMockCrack(deviceId, i));
  }
  
  return cracks;
}

/**
 * Generates a single mock crack event with realistic data
 */
function generateSingleMockCrack(deviceId: string, offset: number = 0): CrackEvent {
  const baseKm = 140 + Math.random() * 10;
  const baseLat = 28.6155 + (Math.random() - 0.5) * 0.01;
  const baseLng = 77.2100 + (Math.random() - 0.5) * 0.01;
  
  const severities: ('HIGH' | 'MEDIUM' | 'LOW')[] = ['HIGH', 'MEDIUM', 'LOW'];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const statuses: ('pending' | 'confirmed' | 'ignored')[] = ['pending', 'confirmed', 'ignored'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const confidence = Math.floor(Math.random() * 40) + (severity === 'HIGH' ? 80 : 50);
  
  const now = new Date();
  now.setSeconds(now.getSeconds() - (offset * 60)); // Stagger timestamps
  
  return {
    id: `${deviceId}-${Date.now()}-${Math.random()}`,
    type: 'Crack Detected',
    severity,
    location: `Track Marker KM ${baseKm.toFixed(1)}`,
    km: baseKm,
    timestamp: now.toISOString(),
    status,
    confidence,
    gps: {
      lat: baseLat,
      lng: baseLng
    },
    media: null,
    description: generateDescription(severity, confidence),
    deviceId,
    sensorId: 'IR_Bottom'
  };
}

/**
 * Generates contextual description based on severity and confidence
 */
function generateDescription(severity: string, confidence: number): string {
  const descriptions: { [key: string]: string[] } = {
    HIGH: [
      "Significant transverse crack detected on the rail head surface.",
      "Rail head shelling detected with visible crack propagation.",
      "Severe longitudinal crack confirmed on rail foot."
    ],
    MEDIUM: [
      "Surface-level hairline crack detected on the rail web.",
      "Stress fracture identified on rail flange.",
      "Surface irregularity with crack indicators detected."
    ],
    LOW: [
      "Minor surface irregularity detected.",
      "Weak signal detected on sensor array.",
      "Surface abrasion detected on rail surface."
    ]
  };
  
  const list = descriptions[severity] || descriptions.LOW;
  return list[Math.floor(Math.random() * list.length)];
}
