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
  getSpotifyToken,
  refreshSpotifyToken,
  removeCustomArtist
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

router.post("/spotify/token", getSpotifyToken);  // Route to exchange code for access token
router.post("/spotify/refresh", refreshSpotifyToken); // Route to refresh token
router.post('/remove-artist', authMiddleware, removeCustomArtist);


export default router;
