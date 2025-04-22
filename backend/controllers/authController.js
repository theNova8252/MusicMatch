import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
export const removeCustomArtist = async (req, res) => {
  const { artist } = req.body;
  if (!artist) return res.status(400).json({ message: 'Artist name is required.' });

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const currentArtists = user.favoriteArtists ? user.favoriteArtists.split(', ') : [];
    const updatedArtists = currentArtists.filter((a) => a !== artist);

    user.favoriteArtists = updatedArtists.join(', ');
    await user.save();

    res.json({ message: 'Artist removed.', artists: updatedArtists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove artist.' });
  }
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
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-currently-playing',
  ].join(' ');
  console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
  console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET);
  console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);

  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${
    process.env.SPOTIFY_CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURIComponent(
    process.env.SPOTIFY_REDIRECT_URI,
  )}&scope=${encodeURIComponent(scopes)}`;

  console.log('🔗 Redirecting to Spotify Auth URL:', spotifyAuthUrl);
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
    console.log('🔑 Successfully received Spotify Access Token:', accessToken);

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

    // **Ensure session is saved**
    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session Save Error:', err);
      }
      console.log('✅ Session Saved Successfully:', req.session);
      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:9000';
      res.redirect(user.isNewUser ? `${frontendBase}/onboarding` : `${frontendBase}/dashboard`);
    });
  } catch (error) {
      console.log('🔥 SPOTIFY CALLBACK ERROR:', error.response?.data || error.message);
    res.status(500).send('Failed to authenticate with Spotify.');
  }
};
export async function getSpotifyToken(req, res) {
  const { code } = req.body; // The authorization code received from frontend
  const redirectUri = 'http://localhost:5000/api/auth/spotify/callback'; // Must match Spotify Developer settings

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required.' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Store the token in the session or database
    req.session.spotifyAccessToken = access_token;
    req.session.spotifyRefreshToken = refresh_token;
    req.session.spotifyTokenExpires = Date.now() + expires_in * 1000;

    res.json({ access_token, refresh_token, expires_in });
  } catch (error) {
    console.error('Spotify Token Exchange Error:', error.response?.data || error.message);
    res.status(400).json({ error: 'Failed to exchange authorization code for access token.' });
  }
}

export async function refreshSpotifyToken(req, res) {
  const refreshToken = req.session.spotifyRefreshToken; // Retrieve refresh token from session

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token available.' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, expires_in } = response.data;

    // Update session with new token
    req.session.spotifyAccessToken = access_token;
    req.session.spotifyTokenExpires = Date.now() + expires_in * 1000;

    res.json({ access_token, expires_in });
  } catch (error) {
    console.error('Spotify Refresh Token Error:', error.response?.data || error.message);
    res.status(400).json({ error: 'Failed to refresh Spotify access token.' });
  }
}
export const googleLogin = (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=profile%20email`;
  res.redirect(googleAuthUrl);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No authorization code provided.');

  try {
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token', 
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const userData = userResponse.data;

    let user = await User.findOne({ where: { email: userData.email } });

    if (!user) {
      user = await User.create({
        name: userData.name,
        username: userData.name.split(' ')[0],
        email: userData.email,
        profileImage: userData.picture,
        googleToken: accessToken,
        isNewUser: true,
      });
    } else {
      user.googleToken = accessToken;

      if (!user.profileImage && userData.picture) {
        user.profileImage = userData.picture;
      }

      await user.save();
    }

    req.session.userId = user.id;

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
    console.log('Received Onboarding Data:', req.body);
    console.log('Received File:', req.file); // Debug file upload

    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    const userId = req.session.userId;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (req.body.username && req.body.username.trim() !== '') {
      user.name = req.body.username;
    }

    if (req.body.dateOfBirth && req.body.dateOfBirth.trim() !== '') {
      user.dateOfBirth = req.body.dateOfBirth;
    }

    if (req.body.email && req.body.email.trim() !== '') {
      user.email = req.body.email;
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    if (req.body.favoriteArtists) {
      try {
        const artists = JSON.parse(req.body.favoriteArtists);
        if (Array.isArray(artists)) {
          user.favoriteArtists = artists.join(', ');
        }
      } catch (e) {
        console.error('Error parsing favoriteArtists:', e);
      }
    }

    // Mark user as no longer new
    user.isNewUser = false;

    // Save changes to the database
    await user.save();

    console.log('User successfully updated:', user);

    res.json({
      success: true,
      message: 'Onboarding data saved successfully!',
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        profileImage: user.profileImage,
        favoriteArtists: user.favoriteArtists ? user.favoriteArtists.split(', ') : [],
        isNewUser: user.isNewUser,
      },
    });
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
    console.log('Fetching User Data:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let spotifyData = {
      topArtists: [],
      topTracks: [],
      currentPlayback: null,
    };

    if (user.spotifyToken) {
      try {
        const token = user.spotifyToken;

        const topArtistsResponse = await axios.get(
          'https://api.spotify.com/v1/me/top/artists?limit=10',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const topTracksResponse = await axios.get(
          'https://api.spotify.com/v1/me/top/tracks?limit=10',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        spotifyData.topArtists = topArtistsResponse.data.items;
        spotifyData.topTracks = topTracksResponse.data.items;
      } catch (error) {
        console.error('Failed to fetch Spotify data:', error.message);
      }
    }

    console.log('Sending User Profile:', { user, spotifyData });
    console.log('Fetching Updated User Data:', user);

    const profileImageUrl = user.profileImage
      ? `${process.env.BASE_URL}${user.profileImage}`
      : null;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImageUrl,
        dateOfBirth: user.dateOfBirth,
        favoriteArtists: user.favoriteArtists ? user.favoriteArtists.split(', ') : [],
        isNewUser: user.isNewUser,
      },
      spotifyData,
    });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};
export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.status(500).json({ message: 'Failed to log out.' });
    }

    // Clear all session cookies
    res.clearCookie('connect.sid', { path: '/' });
    res.clearCookie('token');

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
export const addFavoriteArtist = async (req, res) => {
  const { artist } = req.body;
  if (!artist) return res.status(400).json({ message: 'Artist name is required.' });

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const current = user.favoriteArtists ? user.favoriteArtists.split(', ') : [];
    if (!current.includes(artist)) {
      current.push(artist);
      user.favoriteArtists = current.join(', ');
      await user.save();
    }

    res.json({ message: 'Artist added.', artists: current });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add artist.' });
  }
};

export const getFavoriteArtists = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const artists = user.favoriteArtists ? user.favoriteArtists.split(', ') : [];
    res.json({ artists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch artists.' });
  }
};

export const removeFavoriteArtist = async (req, res) => {
  const artist = decodeURIComponent(req.params.artist);

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const current = user.favoriteArtists ? user.favoriteArtists.split(', ') : [];
    const filtered = current.filter((a) => a !== artist);
    user.favoriteArtists = filtered.join(', ');
    await user.save();

    res.json({ message: 'Artist removed.', artists: filtered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove artist.' });
  }
};