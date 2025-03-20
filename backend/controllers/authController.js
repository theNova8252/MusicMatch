import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const deleteAccount = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.user.id;
    await User.destroy({ where: { id: userId } });

    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Account deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting account:', error.message);
    res
      .status(500)
      .json({ success: false, message: 'Error deleting account', error: error.message });
  }
};
export const spotifyLogin = (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&scope=user-read-private user-read-email user-top-read user-read-currently-playing`;
  res.redirect(spotifyAuthUrl);
};

export const spotifyCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No authorization code provided.');

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const accessToken = tokenResponse.data.access_token;
    console.log('🔑 Spotify Access Token:', accessToken);

    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userResponse.data;
    console.log('👤 Spotify User Data:', userData);

    let user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      user = await User.create({
        name: userData.display_name || 'Spotify User',
        email: userData.email,
        spotifyToken: accessToken,
        profileImage: userData.images?.[0]?.url || null,
        isNewUser: true,
      });
    } else {
      user.spotifyToken = accessToken;
      user.profileImage = userData.images?.[0]?.url || user.profileImage;
      await user.save();
    }

    console.log('User Updated:', user);

    req.session.userId = user.id;
    req.session.save(); // Ensure session is saved before redirecting

    // Redirect to appropriate page
    res.redirect(
      user.isNewUser ? 'http://localhost:9000/onboarding' : 'http://localhost:9000/dashboard',
    );
  } catch (error) {
    console.error('Spotify Callback Error:', error.response?.data || error.message);
    res.status(500).send('Failed to authenticate with Spotify.');
  }
};
export const googleLogin = (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=profile%20email`;
  res.redirect(googleAuthUrl);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No authorization code provided.');

  try {
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userResponse.data;

    let user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      user = await User.create({
        name: userData.name,
        username: userData.name.split(' ')[0], // Default username to first name
        email: userData.email,
        profileImage: userData.picture,
        googleToken: accessToken,
        isNewUser: true,
      });
    } else {
      // Update existing user's Google token
      user.googleToken = accessToken;
      
      // Update profile image if not already set
      if (!user.profileImage && userData.picture) {
        user.profileImage = userData.picture;
      }
      
      await user.save();
    }

    req.session.userId = user.id;

    // Redirect based on whether user has completed onboarding
    if (user.isNewUser) {
      return res.redirect('http://localhost:9000/onboarding');
    } else {
      return res.redirect('http://localhost:9000/dashboard');
    }
  } catch (error) {
    console.error('Google Callback Error:', error.response?.data || error.message);
    res.status(500).send('Failed to authenticate with Google.');
  }
};

export const saveOnboardingData = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    const { username, dateOfBirth, favoriteArtists } = req.body;
    const userId = req.session.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update user details
    user.username = username || user.username;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.favoriteArtists = Array.isArray(favoriteArtists) ? favoriteArtists.join(', ') : '';

    await user.save();

    res.json({ success: true, message: 'Onboarding data saved successfully!' });
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    res.status(500).json({ message: 'Failed to save onboarding data', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const response = {
      user: {
        id: user.id,
        name: user.name,
        username: user.username || '',
        email: user.email || '',
        profileImage: user.profileImage || '',
        dateOfBirth: user.dateOfBirth || '',
        favoriteArtists: user.favoriteArtists ? user.favoriteArtists.split(', ') : [],
        isNewUser: user.isNewUser,
        spotifyToken: user.spotifyToken || null,
      },
      spotifyData: {
        topArtists: [],
        topTracks: [],
        currentPlayback: null,
      },
    };

    if (user.spotifyToken) {
      try {
        const token = user.spotifyToken;
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, topArtistsRes, topTracksRes, playbackRes] = await Promise.all([
          axios.get('https://api.spotify.com/v1/me', { headers }).catch(() => null),
          axios
            .get('https://api.spotify.com/v1/me/top/artists?limit=10', { headers })
            .catch(() => null),
          axios
            .get('https://api.spotify.com/v1/me/top/tracks?limit=10', { headers })
            .catch(() => null),
          axios.get('https://api.spotify.com/v1/me/player', { headers }).catch(() => null),
        ]);

        response.spotifyData.profile = profileRes?.data || null;
        response.spotifyData.topArtists = topArtistsRes?.data?.items || [];
        response.spotifyData.topTracks = topTracksRes?.data?.items || [];
        response.spotifyData.currentPlayback = playbackRes?.data || null;
      } catch (error) {
        console.error('Spotify API error:', error.message);
      }
    }

    res.json(response);
  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.status(500).json({ message: 'Failed to log out.' });
    }

    res.clearCookie('connect.sid', { path: '/' });
    return res.status(200).json({ message: 'Logged out successfully!' });
  });
};

export const addCustomArtist = async (req, res) => {
  const { artist } = req.body;
  if (!artist) return res.status(400).json({ message: 'Artist name is required.' });

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const currentArtists = user.favoriteArtists ? user.favoriteArtists.split(', ') : [];
    if (!currentArtists.includes(artist)) {
      currentArtists.push(artist);
      user.favoriteArtists = currentArtists.join(', ');
      await user.save();
    }

    res.json({ message: 'Artist added successfully.', artists: currentArtists });
  } catch (error) {
    console.error('Add Artist Error:', error.message);
    res.status(500).json({ message: 'Failed to add artist.' });
  }
};

export const saveUserDetails = async (req, res) => {
  try {
    const { username, dateOfBirth } = req.body;
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.username = username;
    user.dateOfBirth = dateOfBirth;
    await user.save();

    res.json({ message: 'User details saved successfully!' });
  } catch (error) {
    console.error('Failed to save user details:', error.message);
    res.status(500).json({ message: 'Failed to save user details.' });
  }
};

export const fetchSpotifyArtists = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.spotifyToken) {
      return res.status(400).json({ message: 'No Spotify token found' });
    }

    const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10', {
      headers: { Authorization: `Bearer ${user.spotifyToken}` },
    });

    res.json(response.data.items);
  } catch (error) {
    console.error('Failed to fetch Spotify artists:', error.message);
    res.status(500).json({ message: 'Failed to fetch Spotify artists.' });
  }
};