import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/all', authMiddleware, async (req, res) => {
  try {
    console.log('💡 Current session:', req.session);
    console.log('👤 Current user ID:', req.session.userId);

    const currentUserId = req.session.user?.id || req.session.userId;

    const currentUser = await User.findByPk(currentUserId);
    const currentArtists = (currentUser.favoriteArtists || '')
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter((a) => a);

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId },
      },
      attributes: ['id', 'name', 'email', 'profileImage', 'favoriteArtists'],
    });

    const enriched = users.map((user) => {
      const theirArtists = (user.favoriteArtists || '')
        .split(',')
        .map((a) => a.trim().toLowerCase())
        .filter((a) => a);

      const shared = currentArtists.filter((a) => theirArtists.includes(a));
      const totalUnique = new Set([...currentArtists, ...theirArtists]).size;
      const compatibility = totalUnique === 0 ? 0 : Math.round((shared.length / totalUnique) * 100);

      return {
        ...user.toJSON(),
        compatibility,
      };
    });

    res.json({ users: enriched });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

export default router;
