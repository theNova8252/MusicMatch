import { userSockets } from './socketStore.js';
import Message from '../models/Message.js'; // <-- Add this import

export function setupWebSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('user_connected', (userId) => {
      userSockets.set(userId, socket);
      socket.userId = userId;
    });

    socket.on('send_message', async (msg) => {
      // msg: { senderId, receiverId, content }
      // Save to DB
      const saved = await Message.create({
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        timestamp: new Date(),
      });

      // Send to receiver and sender
      const receiverSocket = userSockets.get(msg.receiverId);
      if (receiverSocket) {
        receiverSocket.emit('receive_message', saved);
      }
      socket.emit('receive_message', saved);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });
  });
}
