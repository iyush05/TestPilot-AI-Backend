// src/websocket/socket.ts
import { WebSocketServer } from "ws";

export function setupWebSocket(server: any) {
  console.log("🚀 setupWebSocket called"); // 🔥 ADD THIS

  const wss = new WebSocketServer({ server });

  console.log("✅ WebSocket server initialized"); // 🔥 ADD THIS

  return wss;
}