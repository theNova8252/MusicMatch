// ws/socketHandler.js
import Message from '../models/Message.js';
import { userSockets } from './socketStore.js';

export function setupWebSocketHandlers(ws, userId) {
  ws.on('message', async (msg) => {
    try {
      const parsed = JSON.parse(msg);

      if (parsed.type === 'sendMessage') {
        const { toUserId, content } = parsed;

        // Save message to DB
        const saved = await Message.create({
          senderId: userId,
          receiverId: toUserId,
          content,
        });

        // Send to receiver if online
        const receiverSocket = userSockets.get(toUserId);
        if (receiverSocket && receiverSocket.readyState === ws.OPEN) {
          receiverSocket.send(
            JSON.stringify({
              type: 'receiveMessage',
              message: {
                id: saved.id,
                content: saved.content,
                senderId: saved.senderId,
                receiverId: saved.receiverId,
                timestamp: saved.createdAt,
              },
            }),
          );
        }

        // Echo back to sender (optional)
        ws.send(
          JSON.stringify({
            type: 'sentMessage',
            message: {
              id: saved.id,
              content: saved.content,
              senderId: saved.senderId,
              receiverId: saved.receiverId,
              timestamp: saved.createdAt,
            },
          }),
        );
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });
}
