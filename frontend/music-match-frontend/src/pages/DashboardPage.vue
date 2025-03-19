<template>
  <q-page class="flex flex-center column">
    <div class="profile-container">
      <q-btn color="primary" flat label="Sign Out" class="sign-out-btn" icon="logout" @click="logout" />

      <div class="profile-header">
        <q-avatar size="100px" class="profile-img">
          <q-img v-if="userData.profileImage" :src="userData.profileImage" fit="cover" />
          <q-icon v-else name="person" size="64px" color="grey-4" />
        </q-avatar>
        <h1 class="profile-name">{{ userData.name || 'Guest' }}</h1>
        <p class="profile-email">{{ userData.email }}</p>
      </div>

      <q-card class="info-card">
        <q-card-section>
          <div class="section">
            <div class="section-header">
              <h3 class="section-title">Favorite Artists</h3>
              <div class="artist-input">
                <q-input v-model="customArtist" label="Add artist" dense outlined class="artist-field" />
                <q-btn icon="add" round flat color="primary" size="sm" @click="addArtist" />
              </div>
            </div>

            <div v-if="userData.favoriteArtists?.length" class="artist-list">
              <q-chip v-for="artist in userData.favoriteArtists" :key="artist" class="artist-chip" color="primary"
                text-color="white" removable @remove="removeArtist(artist)">
                {{ artist }}
              </q-chip>
            </div>
            <p v-else class="empty-state">No favorite artists added yet.</p>
          </div>

          <q-separator class="section-divider" />

          <div class="section">
            <h3 class="section-title">Spotify Top Artists</h3>
            <div v-if="spotifyData.topArtists?.length" class="grid">
              <q-card v-for="artist in spotifyData.topArtists" :key="artist.id" class="spotify-card">
                <q-img :src="artist.images?.[0]?.url || 'https://via.placeholder.com/100'" class="spotify-img" />
                <div class="spotify-overlay">
                  <p class="spotify-text">{{ artist.name }}</p>
                </div>
              </q-card>
            </div>
            <p v-else class="empty-state">No top artists found.</p>
          </div>

          <q-separator class="section-divider" />

          <div class="section">
            <h3 class="section-title">Spotify Top Songs</h3>
            <div v-if="spotifyData.topTracks?.length" class="grid">
              <q-card v-for="track in spotifyData.topTracks" :key="track.id" class="spotify-card">
                <q-img :src="track.album.images?.[0]?.url || 'https://via.placeholder.com/100'" class="spotify-img" />
                <div class="spotify-overlay">
                  <p class="spotify-text">{{ track.name }}</p>
                  <p class="spotify-subtext">{{ track.artists[0].name }}</p>
                </div>
              </q-card>
            </div>
            <p v-else class="empty-state">No top tracks found.</p>
          </div>

          <q-separator v-if="spotifyData.currentPlayback" class="section-divider" />

          <div class="section" v-if="spotifyData.currentPlayback">
            <h3 class="section-title">Now Playing</h3>
            <q-card class="now-playing-card">
              <q-img
                :src="spotifyData.currentPlayback.item?.album.images?.[0]?.url || 'https://via.placeholder.com/100'"
                class="now-playing-img" />
              <div class="now-playing-info">
                <p class="now-playing-title">{{ spotifyData.currentPlayback.item?.name || 'Unknown' }}</p>
                <p class="now-playing-artist">{{ spotifyData.currentPlayback.item?.artists?.[0]?.name || 'Unknown' }}
                </p>
              </div>
              <q-icon name="music_note" size="24px" class="now-playing-icon" />
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';

const router = useRouter();
const $q = useQuasar();

const userData = ref({
  name: '',
  email: '',
  profileImage: null,
  favoriteArtists: []
});

const spotifyData = ref({
  topArtists: [],
  topTracks: [],
  currentPlayback: null
});

const customArtist = ref('');
const loading = ref(false);

async function fetchUserProfile() {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });

    // Set user data with safe defaults
    userData.value = {
      id: res.data.user?.id || '',
      name: res.data.user?.name || 'Guest',
      username: res.data.user?.username || '',
      email: res.data.user?.email || '',
      profileImage: res.data.user?.profileImage || null,
      favoriteArtists: res.data.user?.favoriteArtists || []
    };

    // Set Spotify data with safe defaults
    if (res.data.spotifyData) {
      spotifyData.value = {
        topArtists: res.data.spotifyData.topArtists || [],
        topTracks: res.data.spotifyData.topTracks || [],
        currentPlayback: res.data.spotifyData.currentPlayback || null
      };
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error.response?.data || error.message);

    // If unauthorized, redirect to login
    if (error.response?.status === 401) {
      router.push('/login');
    } else {
      $q.notify({
        color: 'negative',
        message: 'Failed to load profile data',
        icon: 'error'
      });
    }
  } finally {
    loading.value = false;
  }
}

async function addArtist() {
  if (!customArtist.value.trim()) return;

  try {
    await axios.post(
      'http://localhost:5000/api/auth/add-artist',
      { artist: customArtist.value.trim() },
      { withCredentials: true }
    );

    // Add to local list
    if (!userData.value.favoriteArtists) {
      userData.value.favoriteArtists = [];
    }
    userData.value.favoriteArtists.push(customArtist.value.trim());

    // Clear input
    customArtist.value = '';

    $q.notify({
      color: 'positive',
      message: 'Artist added successfully',
      icon: 'check_circle'
    });
  } catch (error) {
    console.error('Failed to add artist:', error.response?.data || error.message);
    $q.notify({
      color: 'negative',
      message: 'Failed to add artist',
      icon: 'error'
    });
  }
}

async function removeArtist(artist) {
  // Simple UI removal for now
  // In a real app, you'd want to add a backend endpoint to remove artists
  userData.value.favoriteArtists = userData.value.favoriteArtists.filter(a => a !== artist);

  $q.notify({
    color: 'info',
    message: `${artist} removed from favorites`,
    icon: 'info'
  });
}

// Replace your current logout function with this:
async function logout() {
  try {
    await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });

    // Clear local storage and cookies
    localStorage.removeItem('authToken');
    sessionStorage.clear();

    // Use a simple alert instead of Quasar notification
    alert('Logged out successfully');

    // Redirect to login page
    router.push('/login');
  } catch (error) {
    console.error('Failed to log out:', error.response?.data || error.message);
    alert('Failed to log out');
  }
}

onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
/* Modern white theme */
.q-page {
  background: #f8f9fa;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Profile container */
.profile-container {
  position: relative;
  text-align: center;
  padding: 40px 20px;
  width: 90%;
  max-width: 1000px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

/* Sign out button */
.sign-out-btn {
  position: absolute;
  top: 20px;
  right: 20px;
}

/* Profile header */
.profile-header {
  margin-bottom: 30px;
}

/* Profile picture */
.profile-img {
  border: 2px solid #f2f2f2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  margin-bottom: 15px;
  overflow: hidden;
}

/* Profile name and email */
.profile-name {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.profile-email {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

/* Card for user info */
.info-card {
  width: 100%;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* Sections */
.section {
  margin: 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-divider {
  margin: 30px 0;
}

/* Artist input */
.artist-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.artist-field {
  width: 200px;
}

/* Favorite artists */
.artist-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  justify-content: center;
}

.artist-chip {
  transition: all 0.2s ease;
}

.artist-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

/* Grid layout for top artists and tracks */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

/* Spotify cards */
.spotify-card {
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.spotify-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.spotify-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.spotify-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 15px 10px;
  transition: all 0.3s ease;
}

.spotify-card:hover .spotify-overlay {
  padding-bottom: 25px;
}

.spotify-text {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.spotify-subtext {
  font-size: 12px;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
}

/* Now playing */
.now-playing-card {
  display: flex;
  align-items: center;
  background: linear-gradient(to right, #f5f7fa, #c3cfe2);
  padding: 15px;
  border-radius: 15px;
  gap: 15px;
  position: relative;
  overflow: hidden;
}

.now-playing-img {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.now-playing-info {
  flex: 1;
  text-align: left;
}

.now-playing-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
}

.now-playing-artist {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.now-playing-icon {
  color: rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 15px;
}

/* Empty states */
.empty-state {
  color: #999;
  text-align: center;
  font-style: italic;
  margin: 20px 0;
}
</style>