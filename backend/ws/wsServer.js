import WebSocket from 'ws';
import { userSockets } from './socketStore.js';
import sessionMiddleware from '../middleware/session.js'; // <-- you need to share session

export function setupWebSocket(server) {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    sessionMiddleware(req, {}, () => {
      if (!req.session || !req.session.userId) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    });
  });

  wss.on('connection', (ws, req) => {
    const userId = req.session.userId;
    console.log(`🔌 User ${userId} connected to WebSocket`);

    // Store socket
    userSockets.set(userId, ws);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'send-message') {
          const { receiverId, content } = data;

          const newMessage = {
            id: Date.now().toString(),
            senderId: userId,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
          };

          // Send to receiver if online
          const receiverSocket = userSockets.get(receiverId);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(
              JSON.stringify({
                type: 'new-message',
                message: newMessage,
              }),
            );
          }

          // Optionally: echo back to sender too
          ws.send(
            JSON.stringify({
              type: 'new-message',
              message: newMessage,
            }),
          );
        }
      } catch (err) {
        console.error('Failed to process message:', err);
      }
    });

    ws.on('close', () => {
      userSockets.delete(userId);
      console.log(`❌ User ${userId} disconnected`);
    });
  });
}
