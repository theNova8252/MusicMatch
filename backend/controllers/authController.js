import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
export const spotifyLogin = (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${process.env.SPOTIFY_REDIRECT_URI}&scope=user-read-private user-read-email user-top-read`;
  res.redirect(spotifyAuthUrl);
};

// Spotify Login
// Spotify Callback
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
        name: userData.display_name,
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
    res.redirect('http://localhost:9000/dashboard');
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
        email: userData.email,
        profileImage: userData.picture,
        googleToken: accessToken,
        isNewUser: true,
      });

      req.session.userId = user.id;

      return res.redirect('http://localhost:9000/onboarding');
    }

    req.session.userId = user.id;

    if (user.isNewUser) {
      return res.redirect('http://localhost:9000/onboarding');
    }

    return res.redirect('http://localhost:9000/dashboard');
  } catch (error) {
    console.error('Google Callback Error:', error.response?.data || error.message);
    res.status(500).send('Failed to authenticate with Google.');
  }
};

export const getSpotifyToken = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || !user.spotifyToken) {
      return res.status(404).json({ message: 'Spotify token not found.' });
    }
    res.json({ token: user.spotifyToken });
  } catch (error) {
    console.error('Failed to fetch Spotify token:', error.message);
    res.status(500).json({ message: 'Failed to fetch token.' });
  }
};


// Google Callback

export const saveOnboardingData = async (req, res) => {
  try {
    const { favoriteArtists, favoriteTracks } = req.body;
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favoriteArtists = favoriteArtists.join(', ');
    user.favoriteTracks = favoriteTracks.join(', ');
    user.isNewUser = false;
    await user.save();

    res.json({ message: 'Onboarding data saved successfully!' });
  } catch (error) {
    console.error('Failed to save onboarding data:', error.message);
    res.status(500).json({ message: 'Failed to save onboarding data.' });
  }
};

// Get Spotify User Profile & Stats
export const getUserProfile = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      console.warn('No session found.');
      return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    // 🔍 Fetch user from database
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      console.warn('User not found for session ID:', req.session.userId);
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log('✅ User Found:', user);

    // 🎫 Retrieve Spotify token
    const token = user.spotifyToken;
    if (!token) {
      console.warn('No Spotify token found for user:', user.email);
      return res.status(404).json({ message: 'Spotify token not available.' });
    }

    console.log('Using Spotify Token:', token);

    // 👤 Fetch Spotify Profile
    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('Spotify Profile:', profileResponse.data);

    // 🎵 Fetch Top Artists
    const topArtistsResponse = await axios.get(
      'https://api.spotify.com/v1/me/top/artists?limit=10',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log('🎵 Top Artists:', topArtistsResponse.data.items);

    // 🎶 Fetch Top Tracks
    const topTracksResponse = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=10', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('🎶 Top Tracks:', topTracksResponse.data.items);

    // ▶️ Fetch Current Playback (optional, ignore errors)
    const playbackResponse = await axios
      .get('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch((err) => {
        console.warn('🚫 No active playback:', err.response?.data || err.message);
        return null;
      });

    // 📤 Send Response
    res.json({
      user: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        isNewUser: user.isNewUser, 
        spotifyToken: token,
        customArtists: user.artists ? user.artists.split(', ') : [],
      },
      spotifyData: {
        profile: profileResponse.data,
        topArtists: topArtistsResponse.data.items,
        topTracks: topTracksResponse.data.items,
        currentPlayback: playbackResponse?.data || null,
      },
    });
  } catch (error) {
    // ❌ Error Handling
    if (error.response) {
      console.error('❌ Spotify API Error:', error.response.data);
      return res.status(error.response.status).json(error.response.data);
    } else {
      console.error('❌ Unexpected Error:', error.message);
      return res.status(500).json({ message: 'Failed to fetch user profile.' });
    }
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
// 🟢 Add Custom Artist
export const addCustomArtist = async (req, res) => {
  const { artist } = req.body;
  if (!artist) return res.status(400).json({ message: 'Artist name is required.' });

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const currentArtists = user.artists ? user.artists.split(', ') : [];
    if (!currentArtists.includes(artist)) {
      currentArtists.push(artist);
      user.artists = currentArtists.join(', ');
      await user.save();
    }

    res.json({ message: 'Artist added successfully.', artists: currentArtists });
  } catch (error) {
    console.error('Add Artist Error:', error.message);
    res.status(500).json({ message: 'Failed to add artist.' });
  }
};
