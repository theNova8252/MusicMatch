import UserLike from '../models/UserLike.js';
import User from '../models/User.js';
import { userSockets } from '../ws/socketStore.js';
import { notifyMatchByEmail } from './authController.js';

export const likeUser = async (req, res) => {
  const fromUserId = req.session.userId;
  const toUserId = parseInt(req.params.toUserId, 10);

  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    return res.status(400).json({ message: 'Invalid like attempt.' });
  }

  try {
    await UserLike.findOrCreate({ where: { fromUserId, toUserId } });

    const mutual = await UserLike.findOne({
      where: {
        fromUserId: toUserId,
        toUserId: fromUserId,
      },
    });

    if (mutual) {
      const fromUser = await User.findByPk(fromUserId);
      const toUser = await User.findByPk(toUserId);

      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

      const formatUserForSocket = (user) => ({
        id: user.id,
        name: user.name,
        profileImage: user.profileImage?.startsWith('http')
          ? user.profileImage
          : user.profileImage
          ? `${baseUrl}${user.profileImage}`
          : null,
        compatibility: 36,
        sharedGenres: user.sharedGenres || [],
        sharedArtists: user.sharedArtists || [],
      });

      const payloadForFrom = JSON.stringify({
        type: 'mutualMatch',
        user: formatUserForSocket(toUser),
      });

      const payloadForTo = JSON.stringify({
        type: 'mutualMatch',
        user: formatUserForSocket(fromUser),
      });

      const fromSocket = userSockets.get(fromUserId);
      const toSocket = userSockets.get(toUserId);

      if (fromSocket && fromSocket.readyState === fromSocket.OPEN) {
        fromSocket.send(payloadForFrom);
      }

      if (toSocket && toSocket.readyState === toSocket.OPEN) {
        toSocket.send(payloadForTo);
      }

      await notifyMatchByEmail(fromUser, toUser);
      await notifyMatchByEmail(toUser, fromUser);
    }

    res.json({ success: true, mutualMatch: !!mutual });
  } catch (err) {
    console.error('Like failed:', err);
    res.status(500).json({ message: 'Failed to like user.' });
  }
};
