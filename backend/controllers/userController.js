// controllers/userController.js

import UserLike from '../models/UserLike.js';
import User from '../models/User.js';
import { userSockets } from '../ws/socketStore.js'; // your Map<userId, WebSocket>
import { notifyMatchByEmail } from './authController.js';

export const likeUser = async (req, res) => {
  const fromUserId = req.session.userId;
  const toUserId = parseInt(req.params.toUserId, 10);

  if (!fromUserId || !toUserId || fromUserId === toUserId) {
    return res.status(400).json({ message: 'Invalid like attempt.' });
  }

  try {
    // record the like
    await UserLike.findOrCreate({ where: { fromUserId, toUserId } });

    // check for mutual
    const mutual = await UserLike.findOne({
      where: {
        fromUserId: toUserId,
        toUserId: fromUserId,
      },
    });

    if (mutual) {
      // fetch minimal user info
      const [me, them] = await Promise.all([User.findByPk(fromUserId), User.findByPk(toUserId)]);

      // helper to format for WS payload
      const format = (user) => ({
        id: user.id,
        name: user.name,
        // ensure full URL for profileImage
        profileImage:
          user.profileImage && !user.profileImage.startsWith('http')
            ? `${process.env.BASE_URL || 'http://localhost:5000'}${user.profileImage}`
            : user.profileImage,
      });

      const payloadForMe = JSON.stringify({ type: 'mutualMatch', user: format(them) });
      const payloadForThem = JSON.stringify({ type: 'mutualMatch', user: format(me) });

      // look up sockets
      const sockMe = userSockets.get(me.id);
      const sockThem = userSockets.get(them.id);

      // send WebSocket message if connected
      if (sockMe && sockMe.readyState === sockMe.OPEN) sockMe.send(payloadForMe);
      if (sockThem && sockThem.readyState === sockThem.OPEN) sockThem.send(payloadForThem);

      // also fire off email notifications
      await notifyMatchByEmail(me, them);
      await notifyMatchByEmail(them, me);
    }

    return res.json({ success: true, mutualMatch: !!mutual });
  } catch (err) {
    console.error('💥 likeUser error:', err);
    return res.status(500).json({ message: 'Failed to like user.' });
  }
};
