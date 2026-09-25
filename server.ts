// Clean up invalid __dirname set by tsx runtime which can cause vite plugins to fail
if ((globalThis as unknown as { __dirname?: string }).__dirname === '.') {
  delete (globalThis as unknown as { __dirname?: string }).__dirname;
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = Number(process.env.PORT) || 3000;

  // Active multiplayer rooms storage
  const rooms = new Map<string, {
    id: string;
    hostWs: WebSocket;
    guestWs?: WebSocket;
    hostName: string;
    guestName?: string;
    p1Char: string;
    p2Char?: string;
    stageId?: string;
    status: 'waiting' | 'playing';
  }>();

  wss.on('connection', (ws) => {
    let currentRoomId: string | null = null;
    let playerRole: 'host' | 'guest' | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { type } = data;

        if (type === 'create_room') {
          currentRoomId = data.roomId || Math.random().toString(36).substring(2, 8).toUpperCase();
          playerRole = 'host';
          rooms.set(currentRoomId, {
            id: currentRoomId,
            hostWs: ws,
            hostName: data.playerName || 'Oyuncu 1',
            p1Char: data.characterId || 'emre',
            stageId: data.stageId || 'bosphorus',
            status: 'waiting'
          });
          ws.send(JSON.stringify({ type: 'room_created', roomId: currentRoomId, role: 'host' }));
          console.log(`Room created: ${currentRoomId} by ${data.playerName}`);
        } 
        else if (type === 'join_room') {
          const room = rooms.get(data.roomId);
          if (!room) {
            ws.send(JSON.stringify({ type: 'error', message: 'Oda bulunamadı veya süresi doldu!' }));
            return;
          }
          if (room.guestWs) {
            ws.send(JSON.stringify({ type: 'error', message: 'Oda zaten dolu!' }));
            return;
          }
          currentRoomId = data.roomId;
          playerRole = 'guest';
          room.guestWs = ws;
          room.guestName = data.playerName || 'Oyuncu 2';
          room.p2Char = data.characterId || 'sibel';
          room.status = 'playing';

          const startPayload = JSON.stringify({
            type: 'start_match',
            roomId: room.id,
            hostName: room.hostName,
            guestName: room.guestName,
            p1Char: room.p1Char,
            p2Char: room.p2Char,
            stageId: room.stageId
          });

          room.hostWs.send(startPayload);
          ws.send(startPayload);
          console.log(`Room joined: ${currentRoomId} by ${room.guestName}`);
        }
        else if (type === 'game_state' || type === 'player_input' || type === 'attack_hit' || type === 'round_over' || type === 'quick_chat' || type === 'char_select' || type === 'player_ready' || type === 'start_game') {
          if (currentRoomId) {
            const room = rooms.get(currentRoomId);
            if (room) {
              const targetWs = playerRole === 'host' ? room.guestWs : room.hostWs;
              if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                targetWs.send(message.toString());
              }
            }
          }
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          const targetWs = playerRole === 'host' ? room.guestWs : room.hostWs;
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({ type: 'opponent_disconnected' }));
          }
          rooms.delete(currentRoomId);
          console.log(`Room closed: ${currentRoomId}`);
        }
      }
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", roomsCount: rooms.size });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
