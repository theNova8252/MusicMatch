import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.session.user?.id || req.session.userId;
    const currentUser = await User.findByPk(currentUserId);

    const currentArtists = (currentUser.favoriteArtists || '')
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    const currentGenres = (currentUser.favoriteGenres || '')
      .split(',')
      .map((g) => g.trim().toLowerCase())
      .filter(Boolean);

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId },
      },
      attributes: ['id', 'name', 'email', 'profileImage', 'favoriteArtists', 'favoriteGenres'],
    });

    const enriched = users.map((user) => {
      const theirArtists = (user.favoriteArtists || '')
        .split(',')
        .map((a) => a.trim().toLowerCase())
        .filter(Boolean);

      const theirGenres = (user.favoriteGenres || '')
        .split(',')
        .map((g) => g.trim().toLowerCase())
        .filter(Boolean);

      const sharedArtists = currentArtists.filter((a) => theirArtists.includes(a));
      const sharedGenres = currentGenres.filter((g) => theirGenres.includes(g));

      const totalUnique = new Set([
        ...currentArtists,
        ...theirArtists,
        ...currentGenres,
        ...theirGenres,
      ]).size;

      const sharedTotal = sharedArtists.length + sharedGenres.length;

      const compatibility = totalUnique === 0 ? 0 : Math.round((sharedTotal / totalUnique) * 100);

      return {
        ...user.toJSON(),
        compatibility,
        sharedArtists,
        sharedGenres,
        favoriteGenres: theirGenres,
      };
    });

    res.json({ users: enriched });
  } catch (err) {
    console.error('💥 Error in /all:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
