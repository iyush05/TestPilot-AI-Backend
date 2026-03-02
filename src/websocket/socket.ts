import { WebSocketServer } from "ws";

export function setupWebSocket(server: any) {
  console.log("setupWebSocket called"); 

  const wss = new WebSocketServer({ server });

  console.log("WebSocket server initialized");

  return wss;
}