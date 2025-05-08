import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { json } from 'sequelize';

dotenv.config();

export const requestAccountDeletion = async (req, res) => {
  try {
    const user = await User.findByPk(req.session.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const link = `${process.env.BACKEND_URL}/api/auth/confirm-delete/${token}`;

    console.log('Sende E-Mail an:', user.email);
    console.log('Token:', token);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"MusicMatch" <noreply@musicmatch.com>',
      to: user.email,
      subject: 'Bestätigung deiner Account-Löschung',
      html: `<p>Hey ${user.name},<br>Klicke <a href="${link}">hier</a>, um deinen Account dauerhaft zu löschen.</p>`,
    });

    res.json({ success: true, message: 'Bestätigungslink per E-Mail gesendet.' });
  } catch (err) {
    console.error('E-Mail Fehler:', err.message);
    res.status(500).json({ success: false, message: 'Fehler beim Versand der E-Mail' });
  }
};


export const confirmAccountDeletion = async (req, res) => {
  try {
    const token = req.params.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    await User.destroy({ where: { id: userId } });
    return res.redirect(`${process.env.FRONTEND_URL}/login`);
  } catch (err) {
    console.error('Token Fehler:', err.message);
    return res.status(400).send('Link ist ungültig oder abgelaufen.');
  }
};



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
    const tokenRes = await axios.post(
      'https://accounts.spotify.com/api/token',
      {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { access_token, refresh_token } = tokenRes.data;

    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = userResponse.data;
    console.log('Spotify User Data:', userData);

    const isExistingLoggedInUser = req.session && req.session.userId;
    let user;

    if (isExistingLoggedInUser) {
      user = await User.findByPk(req.session.userId);

      if (user) {
        user.spotifyToken = access_token;
        user.spotifyRefreshToken = refresh_token;

        if (!user.profileImage && userData.images?.[0]?.url) {
          user.profileImage = userData.images[0].url;
        }

        await user.save();
        console.log('Existing user updated with Spotify:', user);
      }
    } else {
      user = await User.findOne({ where: { email: userData.email } });

      if (!user) {
        user = await User.create({
          name: userData.display_name || 'Spotify User',
          email: userData.email,
          spotifyToken: access_token,
          spotifyRefreshToken: refresh_token,
          profileImage: userData.images?.[0]?.url || null,
          isNewUser: true,
        });
        console.log('New user created with Spotify:', user);
      } else {
        user.spotifyToken = access_token;
        user.spotifyRefreshToken = refresh_token;

        if (!user.profileImage && userData.images?.[0]?.url) {
          user.profileImage = userData.images[0].url;
        }

        await user.save();
        console.log('Existing user (not logged in) updated with Spotify:', user);
      }
    }
    if (!user) {
      console.error('❌ Spotify callback failed: No user found or created.');
      return res.status(500).send('User creation or retrieval failed.');
    }

    req.session.userId = user.id;
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session Save Error:', err);
      }
      console.log('✅ Session Saved Successfully:', req.session);

      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:9000';

      if (user.isNewUser && !isExistingLoggedInUser) {
        res.redirect(`${frontendBase}/onboarding`);
      } else {
        res.redirect(`${frontendBase}/dashboard?spotify_connected=true`);
      }
    });
  } catch (error) {
    console.log('🔥 SPOTIFY CALLBACK ERROR:', error.response?.data || error.message);
    res.status(500).send('Failed to authenticate with Spotify.');
  }
};
export async function getSpotifyToken(req, res) {
  const { code } = req.body; 
  const redirectUri = 'http://localhost:5000/api/auth/spotify/callback'; 

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required.' });
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
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
  const refreshToken = req.session.spotifyRefreshToken; 

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
    if (!userData.email) {
      console.error('Spotify user data has no email:', userData);
      return res
        .status(400)
        .send('Spotify account has no email address. Please use a different account.');
    }
    

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
    console.log('Received File:', req.file); 

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
    if (req.body.favoriteGenres) {
      try {
        const genres = JSON.parse(req.body.favoriteGenres);
        if (Array.isArray(genres)) {
          user.favoriteGenres = genres.join(', ');
        }
      } catch (e) {
        console.error('Error parsing favoriteGenres:', e);
      }
    }

    user.isNewUser = false;

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
        favoriteGenres: user.favoriteGenres ? user.favoriteGenres.split(', ') : [],
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
        

        try {
          const currentPlaybackResponse = await axios.get(
            'https://api.spotify.com/v1/me/player/currently-playing',
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (
            currentPlaybackResponse.status === 200 &&
            currentPlaybackResponse.data &&
            currentPlaybackResponse.data.item
          ) {
            spotifyData.currentPlayback = {
              name: currentPlaybackResponse.data.item.name,
              artist: currentPlaybackResponse.data.item.artists[0].name,
              album: {
                name: currentPlaybackResponse.data.item.album.name,
                image: currentPlaybackResponse.data.item.album.images[0]?.url,
              },
              uri: currentPlaybackResponse.data.item.uri,
              isPlaying: currentPlaybackResponse.data.is_playing,
            };
          }
        } catch (playbackError) {
          console.log(
            'No track currently playing or error fetching playback:',
            playbackError.message,
          );
        }

        spotifyData.topArtists = topArtistsResponse.data.items;
        spotifyData.topTracks = topTracksResponse.data.items;
      } catch (error) {
        console.error('Failed to fetch Spotify data:', error.message);
      }
    }

    console.log('Sending User Profile:', { user, spotifyData });

    const profileImageUrl = user.profileImage
      ? `${process.env.BASE_URL}${user.profileImage}`
      : null;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: profileImageUrl, 
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
export const refreshSpotifyData = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    const user = await User.findByPk(req.session.userId);
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

        try {
          const currentPlaybackResponse = await axios.get(
            'https://api.spotify.com/v1/me/player/currently-playing',
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          
          if (currentPlaybackResponse.status === 200 && currentPlaybackResponse.data && currentPlaybackResponse.data.item) {
            spotifyData.currentPlayback = {
              name: currentPlaybackResponse.data.item.name,
              artist: currentPlaybackResponse.data.item.artists[0].name,
              album: {
                name: currentPlaybackResponse.data.item.album.name,
                image: currentPlaybackResponse.data.item.album.images[0]?.url
              },
              uri: currentPlaybackResponse.data.item.uri,
              isPlaying: currentPlaybackResponse.data.is_playing
            };
          }
        } catch (playbackError) {
          console.log('No track currently playing or error fetching playback:', playbackError.message);
        }

        spotifyData.topArtists = topArtistsResponse.data.items;
        spotifyData.topTracks = topTracksResponse.data.items;
      } catch (error) {
        console.error('Failed to fetch Spotify data:', error.message);
        return res.status(500).json({ message: 'Failed to fetch Spotify data.' });
      }
    }

    res.json({ spotifyData });
  } catch (error) {
    console.error('Failed to refresh Spotify data:', error);
    res.status(500).json({ message: 'Failed to refresh Spotify data.' });
  }
};
export const saveUserDetails = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    const { username, dateOfBirth } = req.body;
    
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update user details
    user.name = username;
    user.dateOfBirth = dateOfBirth;
    await user.save();

    res.json({ 
      message: 'User details updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    console.error('Failed to update user details:', error);
    res.status(500).json({ message: 'Failed to update user details.' });
  }
};
export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.status(500).json({ message: 'Failed to log out.' });
    }

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