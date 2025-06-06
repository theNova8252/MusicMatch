import express from 'express';
import { Op } from 'sequelize';
import Message from '../models/Message.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get messages between two users
router.get('/:partnerId', authMiddleware, async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.session.userId;

    console.log(`Fetching messages between ${userId} and ${partnerId}`);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      order: [['createdAt', 'ASC']],
    });

    console.log(`Found ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.session.userId;

    console.log('Creating message:', { senderId, receiverId, content });

    if (!content) return res.status(400).json({ error: 'Message content is required' });
    if (!receiverId) return res.status(400).json({ error: 'Receiver ID is required' });

    const message = await Message.create({
      content,
      senderId,
      receiverId: parseInt(receiverId),
    });

    console.log('Message created:', message.toJSON());
    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
