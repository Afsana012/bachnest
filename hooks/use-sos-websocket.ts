"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EmergencyAlert } from "@/lib/types";

export function useSosWebSocket(userId: string = "guest") {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/v1"}/emergency?user_id=${userId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "EMERGENCY_ALERT") {
          setAlerts((prev) => [payload.data, ...prev]);
        }
      } catch (e) {
        // Non-JSON ping/pong or system notice
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("PING");
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [userId]);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send("PING");
    }
  }, []);

  return { isConnected, alerts, sendPing };
}
