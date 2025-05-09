import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import axios from 'axios';
import { getFreshSpotifyToken } from '../utils/spotify.js';
import { likeUser } from '../controllers/userController.js';

const router = express.Router();

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

router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Nicht eingeloggt' });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen des Benutzers' });
  }
});

router.post('/like/:toUserId', authMiddleware, likeUser);

export default router;
