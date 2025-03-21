import express from 'express';
import {
  getUserProfile,
  spotifyLogin,
  spotifyCallback,
  googleLogin,
  googleCallback,
  addCustomArtist,
  logoutUser,
  saveUserDetails,
  fetchSpotifyArtists,
  saveOnboardingData,
  deleteAccount,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Test Route
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

router.get('/profile', authMiddleware, getUserProfile);
router.get('/spotify', spotifyLogin);
router.get('/spotify/callback', spotifyCallback);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.post('/save-onboarding-data', authMiddleware, upload.single('profileImage'), saveOnboardingData);
router.get('/logout', logoutUser);
router.post('/save-user-details', authMiddleware, saveUserDetails);
router.get('/fetch-spotify-artists', authMiddleware, fetchSpotifyArtists);
router.delete('/delete-account', authMiddleware, deleteAccount);
router.post('/update-account', authMiddleware, saveUserDetails);
router.post('/add-artist', authMiddleware, addCustomArtist);

router.get('/spotify/token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.spotifyToken) {
      return res.status(404).json({ message: 'Spotify token not found.' });
    }

    console.log('Retrieved Spotify Token:', user.spotifyToken);
    res.json({ token: user.spotifyToken });
  } catch (error) {
    console.error('Failed to fetch Spotify token:', error.message);
    res.status(500).json({ message: 'Failed to fetch token.' });
  }
});

export default router;
