<template>
  <q-page class="flex flex-center column">
    <div class="profile-container">
      <q-btn color="red" label="Sign Out" class="sign-out-btn" @click="logout" />
      <q-img v-if="user.profileImage" :src="user.profileImage" class="profile-img" />

      <h1 class="profile-name">{{ user.name || 'Guest' }}</h1>
      <p class="profile-email">{{ user.email }}</p>

      <q-card class="info-card">
        <q-card-section>
          <div class="section">
            <h3 class="section-title">Favorite Artists</h3>
            <div v-if="user.artists?.length" class="artist-list">
              <q-chip v-for="artist in user.artists" :key="artist" class="artist-chip">{{ artist }}</q-chip>
            </div>
            <p v-else class="empty-state">No favorite artists added yet.</p>

            <div class="artist-input">
              <q-input v-model="customArtist" label="Add a custom artist" dense dark />
              <q-btn icon="add" round color="primary" @click="addArtist" />
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">Spotify Top Artists</h3>
            <div v-if="spotifyTopArtists.length" class="grid">
              <q-card v-for="artist in spotifyTopArtists" :key="artist.name" class="spotify-card">
                <q-img :src="artist.image" class="spotify-img" />
                <p class="spotify-text">{{ artist.name }}</p>
              </q-card>
            </div>
            <p v-else class="empty-state">No top artists found.</p>
          </div>

          <div class="section">
            <h3 class="section-title">Spotify Top Songs</h3>
            <div v-if="spotifyTopTracks.length" class="grid">
              <q-card v-for="track in spotifyTopTracks" :key="track.name" class="spotify-card">
                <q-img :src="track.albumCover" class="spotify-img" />
                <p class="spotify-text">{{ track.name }} by {{ track.artist }}</p>
              </q-card>
            </div>
            <p v-else class="empty-state">No top tracks found.</p>
          </div>

          <div class="section" v-if="currentlyPlaying">
            <h3 class="section-title">Now Playing</h3>
            <q-card class="now-playing-card">
              <q-img :src="currentlyPlaying.albumCover" class="now-playing-img" />
              <div>
                <p class="now-playing-title">{{ currentlyPlaying.name }}</p>
                <p class="now-playing-artist">{{ currentlyPlaying.artist }}</p>
              </div>
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
import axios from 'axios';


const user = ref({});
const customArtist = ref('');
const spotifyTopArtists = ref([]);
const spotifyTopTracks = ref([]);
const currentlyPlaying = ref(null);

async function fetchUserProfile() {
  try {
    const res = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });

    user.value = res.data.user;
    user.value.name = res.data.user.username || "Guest";
    user.value.dateOfBirth = res.data.user.dateOfBirth || "Not provided";
    user.value.artists = res.data.user.favoriteArtists ? res.data.user.favoriteArtists.split(', ') : [];

    spotifyTopArtists.value = res.data.spotifyData.topArtists.map(a => ({
      name: a.name,
      image: a.images?.[0]?.url || 'https://via.placeholder.com/100'
    }));

    spotifyTopTracks.value = res.data.spotifyData.topTracks.map(t => ({
      name: t.name,
      artist: t.artists[0].name,
      albumCover: t.album.images[0].url
    }));

    currentlyPlaying.value = res.data.spotifyData.currentPlayback?.item
      ? {
        name: res.data.spotifyData.currentPlayback.item.name,
        artist: res.data.spotifyData.currentPlayback.item.artists[0].name,
        albumCover: res.data.spotifyData.currentPlayback.item.album.images[0].url
      }
      : null;
  } catch (error) {
    console.error('Failed to fetch profile:', error.response?.data || error.message);
  }
}
async function addArtist() {
  if (!customArtist.value) return;
  try {
    await axios.post('http://localhost:5000/api/auth/add-artist', { artist: customArtist.value }, { withCredentials: true });
    user.value.artists.push(customArtist.value);
    customArtist.value = '';
  } catch (error) {
    console.error('Failed to add artist:', error.response?.data || error.message);
  }
}
const router = useRouter();

async function logout() {
  try {
    await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    document.cookie = 'connect.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

    router.push('/login');
  } catch (error) {
    console.error('Failed to log out:', error.response?.data || error.message);
  }
}


onMounted(() => {
  fetchUserProfile();
  
});

</script>

<style scoped>
/* Background with modern dark theme */
.q-page {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.sign-out-btn {
  position: absolute;
  top: 20px;
  right: 20px;
}
/* Profile container with glass effect */
.profile-container {
  text-align: center;
  padding: 40px;
  width: 90%;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Profile picture */
.profile-img {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #1db954;
  margin-bottom: 15px;
}

/* Profile name and email */
.profile-name {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.profile-email {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 20px;
}

/* Card for user info */
.info-card {
  width: 100%;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 15px;
  padding: 20px;
  color: white;
}

/* Sections */
.section {
  margin-top: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #1db954;
}

/* Artist input */
.artist-input {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

/* Favorite artists */
.artist-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.artist-chip {
  background: #1db954;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
}

/* Grid layout for top artists and tracks */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

/* Spotify cards */
.spotify-card {
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  border-radius: 10px;
  text-align: center;
}

.spotify-img {
  width: 100%;
  height: auto;
  border-radius: 10px;
}

.spotify-text {
  font-size: 14px;
  margin-top: 5px;
  color: white;
}

/* Now playing */
.now-playing-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px;
  border-radius: 10px;
  gap: 10px;
}

.now-playing-img {
  width: 60px;
  height: 60px;
  border-radius: 10px;
}

.now-playing-title {
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.now-playing-artist {
  font-size: 14px;
  color: #b0b0b0;
}

/* Empty states */
.empty-state {
  color: #b0b0b0;
  text-align: center;
}
</style>