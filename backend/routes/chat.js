import express from 'express';
import Message from '../models/Message.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:partnerId', authMiddleware, async (req, res) => {
  const { partnerId } = req.params;
  const userId = req.session.userId;

  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    order: [['createdAt', 'ASC']],
  });

  res.json(messages);
});

router.post('/send', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.session.userId;

  if (!content) return res.status(400).json({ error: 'Message content is required' });

  const message = await Message.create({ content, senderId, receiverId });
  res.json(message);
});

export default router;
