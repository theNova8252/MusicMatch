import express from 'express';
import {
  getUserProfile,
  spotifyLogin,
  spotifyCallback,
  googleLogin,
  googleCallback,
  addCustomArtist
} from '../controllers/authController.js'; // ✅ Import all required functions
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { saveOnboardingData } from '../controllers/authController.js';

const router = express.Router();

// 🟢 Test Route
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});


router.get('/spotify/token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.spotifyToken) {
      return res.status(404).json({ message: 'Spotify token not found.' });
    }

    console.log('🔑 Retrieved Spotify Token:', user.spotifyToken);
    res.json({ token: user.spotifyToken });
  } catch (error) {
    console.error('❌ Failed to fetch Spotify token:', error.message);
    res.status(500).json({ message: 'Failed to fetch token.' });
  }
});
export default router;

// 🟢 Profile Route
router.get('/profile', authMiddleware, getUserProfile);

// 🟢 Spotify Routes
router.get('/spotify', spotifyLogin);
router.get('/spotify/callback', spotifyCallback);

// 🟢 Google Routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.post('/onboarding', saveOnboardingData);


// 🟢 Add Artist
router.post('/add-artist', authMiddleware, addCustomArtist);

export const authRoutes = router;  // ✅ Named Export
