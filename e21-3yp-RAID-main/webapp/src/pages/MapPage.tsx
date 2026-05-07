import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type CrackLocation = {
    sensorId: string;
    timestamp: string;
    deviceId: string;
    crackDetected: boolean;
    status: string;
    lat: number;
    lng: number;
    severity: number;
};

type UltrasonicLocation = {
    sensorId: string;
    timestamp: string;
    deviceId: string;
    obstacleDetected: boolean;
    distanceCm: number;
    lat: number;
    lng: number;
    severity: number;
};

const toSeverityBucket = (severity: number): "HIGH" | "MEDIUM" | "LOW" => {
    if (severity >= 0.7) return "HIGH";
    if (severity >= 0.4) return "MEDIUM";
    return "LOW";
};

const markerColor = (severity: number): string => {
    const bucket = toSeverityBucket(severity);
    if (bucket === "HIGH") return "#dc2626";
    if (bucket === "MEDIUM") return "#f59e0b";
    return "#2563eb";
};

const popupContent = (location: CrackLocation): HTMLElement => {
    const root = document.createElement("div");
    root.className = "text-sm";

    const addRow = (label: string, value: string) => {
        const row = document.createElement("div");
        const strong = document.createElement("strong");
        strong.textContent = `${label}: `;
        row.appendChild(strong);
        row.appendChild(document.createTextNode(value));
        root.appendChild(row);
    };

    addRow("Sensor", location.sensorId);
    addRow("Device", location.deviceId);
    addRow("Status", location.status);
    addRow("Severity", location.severity.toFixed(2));
    addRow("Time", location.timestamp);
    addRow("Lat/Lng", `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);

    return root;
};

const parsePayload = (payload: unknown): CrackLocation | null => {
    if (typeof payload !== "object" || payload === null) return null;
    const obj = payload as Record<string, unknown>;

    const rawLocation = (obj.location as Record<string, unknown> | undefined) ?? {};
    const lat = Number(rawLocation.lat ?? obj.lat ?? rawLocation.latitude ?? obj.latitude ?? 0);
    const lng = Number(rawLocation.lng ?? obj.lng ?? rawLocation.longitude ?? obj.longitude ?? 0);
    const severity = Number(obj.severity ?? 0);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
        return null;
    }

    return {
        sensorId: String(obj.sensorId ?? "unknown"),
        timestamp: String(obj.timestamp ?? ""),
        deviceId: String(obj.deviceId ?? "unknown"),
        crackDetected: Boolean(obj.crackDetected),
        status: String(obj.status ?? "UNKNOWN"),
        lat,
        lng,
        severity: Number.isFinite(severity) ? severity : 0,
    };
};

const parseUltrasonicPayload = (
    payload: unknown,
    fallbackLocation?: { lat: number; lng: number }
): UltrasonicLocation | null => {
    if (typeof payload !== "object" || payload === null) return null;
    const obj = payload as Record<string, unknown>;

    const location = (obj.location as Record<string, unknown> | undefined) ?? {};
    const rawLat = location.lat ?? location.latitude ?? obj.lat ?? obj.latitude;
    const rawLng = location.lng ?? location.longitude ?? obj.lng ?? obj.longitude;

    let lat = Number(rawLat ?? Number.NaN);
    let lng = Number(rawLng ?? Number.NaN);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
        if (!fallbackLocation) {
            return null;
        }
        lat = fallbackLocation.lat;
        lng = fallbackLocation.lng;
    }

    const obstacleDetected =
        typeof obj.obstacleDetected === "string"
            ? obj.obstacleDetected.toLowerCase() === "true"
            : Boolean(obj.obstacleDetected);

    if (!obstacleDetected) {
        return null;
    }

    const distanceCm = Number(obj.distanceCm ?? Number.NaN);
    const distance = Number.isFinite(distanceCm) ? distanceCm : 200;

    const severity = distance <= 25 ? 0.9 : distance <= 50 ? 0.6 : 0.35;

    return {
        sensorId: String(obj.sensorId ?? "ultrasonic"),
        timestamp: String(obj.timestamp ?? ""),
        deviceId: String(obj.deviceId ?? "unknown"),
        obstacleDetected,
        distanceCm: distance,
        lat,
        lng,
        severity,
    };
};

const wsToSockJsUrl = (wsUrl: string): string => {
    return wsUrl.replace(/^ws:/, "http:").replace(/^wss:/, "https:").replace(/\/+$/, "").replace(/\/ws$/, "/raid-websocket");
};

const MapPage = () => {
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080";
    const wsUrl = (import.meta.env.VITE_WS_URL as string | undefined) ?? "ws://localhost:8080/ws";

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerLayerRef = useRef<L.LayerGroup | null>(null);
    const lastRobotPositionRef = useRef<{ lat: number; lng: number } | null>(null);
    const hasCenteredRef = useRef(false);
    const [locations, setLocations] = useState<CrackLocation[]>([]);

    const upsertLocation = useCallback((incoming: CrackLocation) => {
        setLocations((prev) => {
            const key = `${incoming.sensorId}-${incoming.timestamp}`;
            const filtered = prev.filter((p) => `${p.sensorId}-${p.timestamp}` !== key);
            return [incoming, ...filtered].slice(0, 2000);
        });

        lastRobotPositionRef.current = { lat: incoming.lat, lng: incoming.lng };
    }, []);

    useEffect(() => {
        const loadHistory = async () => {
            const crackResponse = await fetch(`${apiBaseUrl}/api/crack-locations`);
            if (!crackResponse.ok) {
                throw new Error(`Failed to fetch crack locations: ${crackResponse.status}`);
            }

            const crackData = (await crackResponse.json()) as unknown[];
            const crackParsed = crackData.map(parsePayload).filter((x): x is CrackLocation => x !== null);

            let ultrasonicParsed: CrackLocation[] = [];
            try {
                const ultrasonicResponse = await fetch(`${apiBaseUrl}/api/ultrasonic`);
                if (ultrasonicResponse.ok) {
                    const ultrasonicData = (await ultrasonicResponse.json()) as unknown[];
                    ultrasonicParsed = ultrasonicData
                        .map((payload) => parseUltrasonicPayload(payload))
                        .filter((x): x is UltrasonicLocation => x !== null)
                        .map((u) => ({
                            sensorId: u.sensorId,
                            timestamp: u.timestamp,
                            deviceId: u.deviceId,
                            crackDetected: true,
                            status: `ULTRASONIC ${u.distanceCm.toFixed(1)}cm`,
                            lat: u.lat,
                            lng: u.lng,
                            severity: u.severity,
                        }));
                }
            } catch (e) {
                console.warn("Failed to fetch ultrasonic history", e);
            }

            setLocations([...crackParsed, ...ultrasonicParsed]);
        };

        loadHistory().catch((err) => {
            console.error(err);
        });
    }, [apiBaseUrl]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) {
            return;
        }

        const map = L.map(mapContainerRef.current, {
            center: [7.8731, 80.7718],
            zoom: 12,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        markerLayerRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            markerLayerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        const layer = markerLayerRef.current;
        if (!map || !layer) {
            return;
        }

        layer.clearLayers();

        locations.forEach((loc) => {
            const color = markerColor(loc.severity);
            const marker = L.circleMarker([loc.lat, loc.lng], {
                radius: 8,
                color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2,
            });

            marker.bindPopup(popupContent(loc));
            marker.addTo(layer);
        });

        if (!hasCenteredRef.current && locations.length > 0) {
            map.setView([locations[0].lat, locations[0].lng], 12);
            hasCenteredRef.current = true;
        }
    }, [locations]);

    useEffect(() => {
        const sockJsUrl = wsToSockJsUrl(wsUrl);

        const client = new Client({
            webSocketFactory: () => new SockJS(sockJsUrl),
            reconnectDelay: 3000,
            onConnect: () => {
                client.subscribe("/topic/cracks", (message) => {
                    try {
                        const payload = JSON.parse(message.body) as unknown;
                        const parsed = parsePayload(payload);
                        if (parsed) {
                            upsertLocation(parsed);
                        }
                    } catch (e) {
                        console.error("Failed to parse /topic/cracks payload", e);
                    }
                });

                client.subscribe("/topic/ultrasonic", (message) => {
                    try {
                        const payload = JSON.parse(message.body) as unknown;
                        const parsed = parseUltrasonicPayload(payload, lastRobotPositionRef.current ?? undefined);
                        if (!parsed) {
                            return;
                        }

                        upsertLocation({
                            sensorId: parsed.sensorId,
                            timestamp: parsed.timestamp,
                            deviceId: parsed.deviceId,
                            crackDetected: true,
                            status: `ULTRASONIC ${parsed.distanceCm.toFixed(1)}cm`,
                            lat: parsed.lat,
                            lng: parsed.lng,
                            severity: parsed.severity,
                        });
                    } catch (e) {
                        console.error("Failed to parse /topic/ultrasonic payload", e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("STOMP error", frame.headers["message"], frame.body);
            },
        });

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [upsertLocation, wsUrl]);

    return <div ref={mapContainerRef} className="w-full h-[calc(100vh-80px)]" />;
};

export default MapPage;
