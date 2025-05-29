import { WebSocketServer } from 'ws'; // Change this line
import { userSockets } from './socketStore.js';
import url from 'url';

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true }); // Change this line

  server.on('upgrade', (req, socket, head) => {
    console.log('WebSocket upgrade attempt');

    // For now, allow all connections and handle auth after connection
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', (ws, req) => {
    console.log('🔌 WebSocket connection established');

    let userId = null;
    let isAuthenticated = false;

    // Send connection request - client must send user ID
    ws.send(
      JSON.stringify({
        type: 'auth-required',
        message: 'Please authenticate',
      }),
    );

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📨 WebSocket message received:', data);

        // Handle authentication
        if (data.type === 'authenticate' && data.userId) {
          userId = data.userId.toString();
          isAuthenticated = true;
          userSockets.set(userId, ws);

          ws.send(
            JSON.stringify({
              type: 'auth-success',
              userId: userId,
            }),
          );

          console.log(`✅ User ${userId} authenticated and connected`);
          return;
        }

        // Require authentication for all other operations
        if (!isAuthenticated) {
          ws.send(
            JSON.stringify({
              type: 'auth-required',
              message: 'Authentication required',
            }),
          );
          return;
        }

        if (data.type === 'send-message') {
          const { receiverId, content } = data;

          const newMessage = {
            id: Date.now().toString(),
            senderId: userId,
            receiverId: receiverId.toString(),
            content,
            timestamp: new Date().toISOString(),
          };

          console.log('📤 Broadcasting message:', newMessage);

          // Send to receiver if online
          const receiverSocket = userSockets.get(receiverId.toString());
          if (receiverSocket && receiverSocket.readyState === ws.OPEN) {
            // Use ws.OPEN instead of WebSocket.OPEN
            receiverSocket.send(
              JSON.stringify({
                type: 'new-message',
                message: newMessage,
              }),
            );
            console.log(`✅ Message sent to receiver ${receiverId}`);
          } else {
            console.log(`❌ Receiver ${receiverId} not online`);
          }

          // Echo back to sender
          ws.send(
            JSON.stringify({
              type: 'new-message',
              message: newMessage,
            }),
          );
          console.log(`✅ Message echoed to sender ${userId}`);
        }

        // Handle typing indicators
        if (data.type === 'typing-start') {
          const { receiverId } = data;
          const receiverSocket = userSockets.get(receiverId.toString());
          if (receiverSocket && receiverSocket.readyState === ws.OPEN) {
            receiverSocket.send(
              JSON.stringify({
                type: 'user-typing',
                senderId: userId,
                isTyping: true,
              }),
            );
          }
        }

        if (data.type === 'typing-stop') {
          const { receiverId } = data;
          const receiverSocket = userSockets.get(receiverId.toString());
          if (receiverSocket && receiverSocket.readyState === ws.OPEN) {
            receiverSocket.send(
              JSON.stringify({
                type: 'user-typing',
                senderId: userId,
                isTyping: false,
              }),
            );
          }
        }
      } catch (err) {
        console.error('❌ Failed to process message:', err);
      }
    });

    ws.on('close', () => {
      if (userId) {
        userSockets.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
      }
    });

    ws.on('error', (error) => {
      console.error(`❌ WebSocket error:`, error);
      if (userId) {
        userSockets.delete(userId);
      }
    });
  });
}
