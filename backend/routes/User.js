import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { Op } from 'sequelize';
import axios from 'axios';
import { getFreshSpotifyToken } from '../utils/spotify.js';
import { likeUser } from '../controllers/userController.js';

const router = express.Router();

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Place /me and /all routes BEFORE /:userId

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.session.user?.id || req.session.userId;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Nicht eingeloggt' });
    }

    const user = await User.findByPk(currentUserId);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen des Benutzers' });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.session.user?.id || req.session.userId;
    const currentUser = await User.findByPk(currentUserId);

    if (!currentUser) {
      return res.status(404).json({ message: 'Current user not found.' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    const currentArtists = (currentUser.favoriteArtists || '')
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean);

    const currentGenres = (currentUser.favoriteGenres || '')
      .split(',')
      .map((g) => g.trim().toLowerCase())
      .filter(Boolean);

    const otherUsers = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId },
      },
      attributes: [
        'id',
        'name',
        'email',
        'profileImage',
        'favoriteArtists',
        'favoriteGenres',
        'spotifyToken',
        'spotifyRefreshToken',
        'bio',
        'dateOfBirth',
      ],
    });

    const enrichedUsers = await Promise.all(
      otherUsers.map(async (user) => {
        const rawUser = user.toJSON();

        const theirArtists = (rawUser.favoriteArtists || '')
          .split(',')
          .map((a) => a.trim().toLowerCase())
          .filter(Boolean);

        const theirGenres = (rawUser.favoriteGenres || '')
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

        let topTracks = [];
        let currentlyPlaying = null;
        let recentlyPlayed = [];

        if (rawUser.spotifyToken && rawUser.spotifyRefreshToken) {
          try {
            const freshToken = await getFreshSpotifyToken(rawUser.spotifyRefreshToken);

            if (!freshToken) throw new Error('No fresh token returned');

            const headers = {
              Authorization: `Bearer ${freshToken}`,
            };

            const topRes = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=5', {
              headers,
            });

            topTracks = topRes.data.items.map((track) => ({
              title: track.name,
              artist: track.artists[0]?.name || 'Unknown Artist',
              uri: track.uri,
            }));

            const playingRes = await axios.get(
              'https://api.spotify.com/v1/me/player/currently-playing',
              { headers },
            );

            if (playingRes.status === 200 && playingRes.data?.item) {
              currentlyPlaying = {
                title: playingRes.data.item.name,
                artist: playingRes.data.item.artists[0]?.name || 'Unknown Artist',
                uri: playingRes.data.item.uri,
                albumImage: playingRes.data.item.album.images[0]?.url || null,
              };
            }

            const recentlyRes = await axios.get(
              'https://api.spotify.com/v1/me/player/recently-played?limit=5',
              { headers },
            );

            if (recentlyRes.status === 200 && Array.isArray(recentlyRes.data.items)) {
              recentlyPlayed = recentlyRes.data.items.map((item) => ({
                title: item.track?.name || 'Unknown Track',
                artist: item.track?.artists?.[0]?.name || 'Unknown Artist',
                playedAt: item.played_at,
                uri: item.track?.uri || null,
                albumImage: item.track?.album?.images?.[0]?.url || null,
              }));
            } else {
              console.warn(`⚠️ Unexpected recentlyPlayed response format for user ${rawUser.id}`);
            }
          } catch (err) {
            console.warn(
              `⚠️ Spotify fetch failed for user ${rawUser.id}:`,
              err.response?.data || err.message,
            );
          }
        }

        return {
          ...rawUser,
          profileImage: rawUser.profileImage?.startsWith('http')
            ? rawUser.profileImage
            : rawUser.profileImage
            ? `${baseUrl}${rawUser.profileImage}`
            : null,
          compatibility,
          sharedArtists,
          sharedGenres,
          favoriteGenres: theirGenres,
          favoriteArtists: rawUser.favoriteArtists,
          topTracks,
          currentlyPlaying,
          recentlyPlayed,
          age: rawUser.dateOfBirth
            ? Math.floor(
                (new Date() - new Date(rawUser.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000),
              )
            : null,
        };
      }),
    );

    res.json({ users: enrichedUsers });
  } catch (err) {
    console.error('💥 Error in /users/all:', err.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.session.user?.id || req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log('Fetching conversations for user:', userId);

    // Get all messages where current user is involved
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      order: [['createdAt', 'DESC']],
    });

    console.log('Found messages:', messages.length);

    if (messages.length === 0) {
      return res.json({ conversations: [] });
    }

    // Get unique user IDs that current user has conversations with
    const otherUserIds = new Set();
    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      otherUserIds.add(otherUserId);
    });

    // Fetch user data for all conversation partners
    const users = await User.findAll({
      where: {
        id: { [Op.in]: Array.from(otherUserIds) },
      },
      attributes: ['id', 'name', 'profileImage'],
    });

    // Create a map of users for quick lookup
    const userMap = new Map();
    users.forEach((user) => {
      userMap.set(user.id, user);
    });

    // Group messages by conversation partner and find the latest message
    const conversationMap = new Map();
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = userMap.get(otherUserId);

      if (!otherUser) return; // Skip if user not found

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            profileImage: otherUser.profileImage?.startsWith('http')
              ? otherUser.profileImage
              : otherUser.profileImage
              ? `${baseUrl}${otherUser.profileImage}`
              : null,
          },
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
          },
          unreadCount: 0, // You can implement this later if needed
        });
      }
    });

    const conversationList = Array.from(conversationMap.values());

    // Sort by last message time (most recent first)
    conversationList.sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt),
    );

    console.log('Returning conversations:', conversationList.length);

    res.json({ conversations: conversationList });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations', details: error.message });
  }
});


// Parameterized route /:userId MUST come AFTER specific routes like /me and /all
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.session.user?.id || req.session.userId;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.params.userId;

    // Validate userId is a number if using integer IDs
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'name',
        'email',
        'profileImage',
        'favoriteArtists',
        'favoriteGenres',
        'bio',
        'dateOfBirth',
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the response to match your existing pattern
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const userData = user.toJSON();

    const formattedUser = {
      ...userData,
      profileImage: userData.profileImage?.startsWith('http')
        ? userData.profileImage
        : userData.profileImage
        ? `${baseUrl}${userData.profileImage}`
        : null,
      age: userData.dateOfBirth
        ? Math.floor((new Date() - new Date(userData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
        : null,
    };

    res.json({ user: formattedUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.session.user?.id || req.session.userId;
    const otherUserId = req.params.otherUserId;

    if (!currentUserId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Validate otherUserId
    if (isNaN(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    console.log(`Fetching messages between ${currentUserId} and ${otherUserId}`);

    // Get all messages between these two users
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            senderId: currentUserId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId,
          },
        ],
      },
      order: [['createdAt', 'ASC']], // Oldest first for chat display
    });

    console.log(`Found ${messages.length} messages`);

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const senderId = req.session.user?.id || req.session.userId;
    const { receiverId, content } = req.body;

    if (!senderId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    // Validate receiverId
    if (isNaN(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create the message
    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim(),
    });

    console.log('Message created:', message.toJSON());

    res.status(201).json({
      message: message.toJSON(),
      success: true,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/like/:toUserId', authMiddleware, likeUser);

export default router;
