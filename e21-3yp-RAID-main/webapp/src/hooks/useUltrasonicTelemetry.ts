import { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { mockUltrasonicData } from "../data/mockData";

export interface UltrasonicEvent {
  sensorId: string;
  deviceId: string;
  timestamp: string;
  distanceCm: number;
  obstacleDetected: boolean;
}

export function useUltrasonicTelemetry(deviceId: string, sensorId: string) {
  const [liveUltrasonic, setLiveUltrasonic] = useState<UltrasonicEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [useMockData, setUseMockData] = useState<boolean>(false);

  useEffect(() => {
    let stompClient: Client | null = null;
    let mockIntervalId: ReturnType<typeof setInterval> | null = null;

    // Try to fetch historical data from backend
    fetch(`http://localhost:8080/api/ultrasonic/${deviceId}/${sensorId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLiveUltrasonic(data.reverse());
        } else {
          setLiveUltrasonic([]);
        }

        // Try WebSocket connection
        stompClient = new Client({
          webSocketFactory: () => new SockJS("http://localhost:8080/raid-websocket"),
          reconnectDelay: 5000,
          onConnect: () => {
            setIsConnected(true);
            setUseMockData(false);

            stompClient?.subscribe("/topic/ultrasonic", (message) => {
              const rawData = JSON.parse(message.body) as UltrasonicEvent;

              if (rawData.deviceId !== deviceId || rawData.sensorId !== sensorId) {
                return;
              }

              setLiveUltrasonic((prev) => [rawData, ...prev].slice(0, 100));
            });
          },
          onDisconnect: () => setIsConnected(false),
          onStompError: (err) => {
            console.error("Ultrasonic broker error:", err);
            setIsConnected(false);
          },
        });

        stompClient.activate();
      })
      .catch((err) => {
        console.warn("Backend unavailable, using mock data:", err);
        setUseMockData(true);
        setLiveUltrasonic([...mockUltrasonicData].reverse());

        // Simulate real-time updates with mock data
        mockIntervalId = setInterval(() => {
          const distances = [35.2, 42.5, 48.3, 65.8, 72.1, 89.5, 95.0, 120.0, 150.0];
          const randomDistance = distances[Math.floor(Math.random() * distances.length)];
          const newEvent: UltrasonicEvent = {
            sensorId,
            deviceId,
            timestamp: new Date().toISOString(),
            distanceCm: randomDistance,
            obstacleDetected: randomDistance <= 50,
          };

          setLiveUltrasonic((prev) => [newEvent, ...prev].slice(0, 100));
        }, 5000); // Simulate 5-second publishing interval
      });

    return () => {
      stompClient?.deactivate();
      setIsConnected(false);
      if (mockIntervalId) {
        clearInterval(mockIntervalId);
      }
    };
  }, [deviceId, sensorId]);

  return { liveUltrasonic, isConnected, useMockData };
}