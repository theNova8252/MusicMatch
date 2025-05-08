// controllers/chatController.js
import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  const senderId = req.session.userId;
  const { receiverId, content } = req.body;

  if (!receiverId || !content) {
    return res.status(400).json({ message: 'Missing data.' });
  }

  try {
    const message = await Message.create({ senderId, receiverId, content });

    // Send real-time message if socket exists
    const receiverSocket = userSockets.get(receiverId);
    if (receiverSocket && receiverSocket.readyState === receiverSocket.OPEN) {
      receiverSocket.send(
        JSON.stringify({
          type: 'new-message',
          message: {
            id: message.id,
            senderId,
            receiverId,
            content,
            timestamp: message.createdAt,
          },
        }),
      );
    }

    res.status(201).json({
      id: message.id,
      senderId,
      receiverId,
      content,
      timestamp: message.createdAt,
    });
  } catch (err) {
    console.error('Send message failed:', err);
    res.status(500).json({ message: 'Message failed.' });
  }
};

export const getMessages = async (req, res) => {
  const userId = req.session.userId;
  const { partnerId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    res.json(
      messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        receiverId: m.receiverId,
        content: m.content,
        timestamp: m.createdAt,
        read: m.read,
      })),
    );
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
};
