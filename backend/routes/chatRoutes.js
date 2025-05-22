import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Get chat between two users
router.get('/:otherUserId', async (req, res) => {
  const { userId } = req.session; // Your session user!
  const { otherUserId } = req.params;

  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const messages = await Message.findAll({
    where: {
      // Either sender or receiver is current user and other user
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    order: [['timestamp', 'ASC']],
  });

  res.json(messages);
});

export default router;
