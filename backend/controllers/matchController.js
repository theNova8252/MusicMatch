import User from '../models/User.js';
import { notifyMatchByEmail } from './authController.js';
import { userSocketMap, io } from '../index.js';

export const handleMatch = async (req, res) => {
  try {
    const likerId = req.session.userId;
    const likedUserId = req.body.userId;

    if (!likerId || !likedUserId) {
      return res.status(400).json({ message: 'Benutzer-ID fehlt.' });
    }

    const liker = await User.findByPk(likerId);
    const likedUser = await User.findByPk(likedUserId);

    if (!liker || !likedUser) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    // 🧠 Später echte Match-Logik einfügen
    const isMutualMatch = true;

    if (isMutualMatch) {
      // 📩 E-Mail an beide
      await notifyMatchByEmail(likedUser, liker);
      await notifyMatchByEmail(liker, likedUser);

      // 🔌 Socket-IDs holen
      const likedUserSocketId = userSocketMap.get(likedUser.id);
      const likerSocketId = userSocketMap.get(liker.id);

      // 🔍 Debug-Ausgabe
      console.log('📡 Sende Socket an:', {
        likerId: liker.id,
        likerSocketId,
        likedUserId: likedUser.id,
        likedUserSocketId,
      });

      // 🔔 Push an likedUser
      if (likedUserSocketId) {
        io.to(likedUserSocketId).emit('matchNotification', {
          message: '🎉 Du hast ein Match!',
          matchedWith: liker.name,
        });
      }

      // 🔔 Push an liker
      if (likerSocketId) {
        io.to(likerSocketId).emit('matchNotification', {
          message: '🎉 Du hast ein Match!',
          matchedWith: likedUser.name,
        });
      }
    }

    return res.json({ success: true, matched: isMutualMatch });
  } catch (err) {
    console.error('❌ Fehler beim Match:', err.stack || err.message || err);
    return res
      .status(500)
      .json({ success: false, message: 'Interner Serverfehler beim Matching.' });
  }
};
