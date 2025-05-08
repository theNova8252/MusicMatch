import express from 'express';
import {
  getUserProfile,
  spotifyLogin,
  spotifyCallback,
  googleLogin,
  googleCallback,
  addCustomArtist,
  logoutUser,
  fetchSpotifyArtists,
  saveOnboardingData,
  deleteAccount,
  getSpotifyToken,
  requestAccountDeletion,
  confirmAccountDeletion,
  refreshSpotifyToken,
  removeCustomArtist,
  refreshSpotifyData,
  saveUserDetails,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

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
router.get('/fetch-spotify-artists', authMiddleware, fetchSpotifyArtists);
router.delete('/delete-account', authMiddleware, deleteAccount);
router.post('/update-account', authMiddleware, saveUserDetails);
router.post('/add-artist', authMiddleware, addCustomArtist);
router.post('/request-account-deletion', authMiddleware, requestAccountDeletion);
router.get('/confirm-delete/:token', confirmAccountDeletion);


router.post("/spotify/token", getSpotifyToken); 
router.post("/spotify/refresh", refreshSpotifyToken); 
router.post('/remove-artist', authMiddleware, removeCustomArtist);
router.get('/refresh-spotify-data', refreshSpotifyData);
router.post('/save-user-details', saveUserDetails);


export default router;
