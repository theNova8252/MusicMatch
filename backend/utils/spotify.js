import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function getFreshSpotifyToken(refreshToken) {
  if (!refreshToken) throw new Error('Missing refresh token');

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

    return response.data.access_token;
  } catch (error) {
    console.error('❌ Error refreshing Spotify token:', error.response?.data || error.message);
    return null;
  }
}
export const makeSpotifyRequestWithAutoRefresh = async (user, endpoint) => {
  if (!user.spotifyRefreshToken) {
    throw new Error('User has no Spotify refresh token');
  }

  const apiUrl = `https://api.spotify.com/v1/${endpoint}`;

  try {
    // First attempt with existing access token
    if (user.spotifyAccessToken) {
      try {
        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
        });
        return response;
      } catch (error) {
        // Token might be expired - only proceed to refresh if that's the case
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.log('⚠️ Token expired, refreshing...');
          // Continue to token refresh below
        } else {
          // For other errors, throw and exit
          throw error;
        }
      }
    }

    // Refresh the token
    const refreshResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: user.spotifyRefreshToken,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          ).toString('base64')}`,
        },
      },
    );

    // Update user token in database
    const newAccessToken = refreshResponse.data.access_token;
    await user.update({ spotifyAccessToken: newAccessToken });

    // If Spotify provided a new refresh token (they sometimes do), update that too
    if (refreshResponse.data.refresh_token) {
      await user.update({ spotifyRefreshToken: refreshResponse.data.refresh_token });
    }

    // Make the original request with the new token
    const response = await axios.get(apiUrl, {
      headers: { Authorization: `Bearer ${newAccessToken}` },
    });

    return response;
  } catch (error) {
    console.error('🔴 Spotify fetch error (non-critical):', error.message);
    throw error;
  }
};

// Helper function to check if Spotify token is valid
export const checkSpotifyToken = async (user) => {
  if (!user.spotifyAccessToken) return false;

  try {
    await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Additional debugging help - add this to your routes file
export const debugSpotifyAuth = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No session found.' });
    }

    const user = await User.findByPk(req.session.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Check if tokens exist
    const tokenInfo = {
      hasAccessToken: !!user.spotifyAccessToken,
      hasRefreshToken: !!user.spotifyRefreshToken,
      accessTokenPreview: user.spotifyAccessToken
        ? `${user.spotifyAccessToken.substring(0, 5)}...`
        : null,
      refreshTokenPreview: user.spotifyRefreshToken
        ? `${user.spotifyRefreshToken.substring(0, 5)}...`
        : null,
    };

    // Test token validity
    let tokenStatus = 'unknown';
    if (user.spotifyAccessToken) {
      try {
        await axios.get('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
        });
        tokenStatus = 'valid';
      } catch (error) {
        tokenStatus = `invalid: ${error.response?.status || error.message}`;
      }
    }

    res.json({ tokenInfo, tokenStatus });
  } catch (error) {
    console.error('Failed to debug Spotify auth:', error);
    res.status(500).json({ message: 'Failed to debug Spotify auth.' });
  }
};
