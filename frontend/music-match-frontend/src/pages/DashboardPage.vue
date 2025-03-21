<template>
  <q-page class="profile-page">
    <div class="blur-bg"></div>
    <div class="profile-container q-pa-md">
      <div class="nav-bar q-mb-lg">
        <h4 class="text-weight-bold q-my-none text-white">MusicMatch</h4>
        <q-btn flat round color="white" icon="logout" @click="logout">
          <q-tooltip>Sign Out</q-tooltip>
        </q-btn>
      </div>

      <div class="profile-header q-mb-xl">
        <div class="profile-header-content">
          <q-avatar size="120px" class="profile-avatar">
            <q-img v-if="userData.profileImage" :src="userData.profileImage" />
            <div v-else class="text-center full-width full-height flex flex-center bg-primary text-white text-h2">
              {{ (userData.username || 'G').charAt(0).toUpperCase() }}
            </div>
          </q-avatar>
          <div class="profile-info q-ml-md">
            <h2 class="text-weight-bold text-white q-my-sm">{{ userData.username || 'Guest' }}</h2>
            <p class="text-grey-4 q-my-sm">{{ userData.email }}</p>
            <q-btn v-if="!userData.spotifyToken" unelevated rounded color="green" class="q-mt-sm spotify-btn"
              label="Connect Spotify" icon="fab fa-spotify" @click="connectSpotify" />
          </div>
        </div>
      </div>

      <div class="content-area">
        <q-card class="profile-card q-mb-md">
          <q-card-section>
            <div class="section-header">
              <h5 class="text-weight-bold q-my-none">Account Information</h5>
              <q-btn flat round color="primary" icon="edit" size="sm">
                <q-tooltip>Edit Profile</q-tooltip>
              </q-btn>
            </div>

            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-input v-model="userData.username" outlined bg-color="grey-1" dense label="Username">
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="userData.email" outlined bg-color="grey-1" dense label="Email">
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="userData.dateOfBirth" outlined bg-color="grey-1" dense label="Date of Birth"
                  type="date">
                  <template v-slot:prepend>
                    <q-icon name="cake" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-file v-model="profileImageFile" outlined bg-color="grey-1" dense label="Profile Picture"
                  @change="uploadProfileImage">
                  <template v-slot:prepend>
                    <q-icon name="add_photo_alternate" />
                  </template>
                </q-file>
              </div>
            </div>

            <div class="row justify-end q-mt-md">
              <q-btn color="primary" label="Save Changes" @click="updateAccountInfo" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="profile-card q-mb-md">
          <q-card-section>
            <div class="section-header">
              <h5 class="text-weight-bold q-my-none">Favorite Artists</h5>
              <q-btn flat round color="primary" icon="playlist_add" size="sm">
                <q-tooltip>Add from recommendations</q-tooltip>
              </q-btn>
            </div>

            <div class="artist-input q-mt-md">
              <q-input v-model="customArtist" outlined bg-color="grey-1" dense label="Add artist"
                placeholder="Add an artist you love">
                <template v-slot:append>
                  <q-btn round flat color="primary" icon="add" @click="addArtist" :disable="!customArtist.trim()" />
                </template>
              </q-input>
            </div>

            <div class="artist-chips q-mt-md">
              <q-chip v-for="artist in userData.favoriteArtists" :key="artist" removable dense color="primary"
                text-color="white" class="q-ma-xs" @remove="removeArtist(artist)">
                {{ artist }}
              </q-chip>
              <div v-if="!userData.favoriteArtists?.length" class="empty-state text-grey q-py-md text-center">
                No favorite artists added yet. Add some artists you love!
              </div>
            </div>
          </q-card-section>
        </q-card>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card class="profile-card">
              <q-card-section>
                <div class="section-header">
                  <h5 class="text-weight-bold q-my-none">Spotify Top Artists</h5>
                  <q-btn flat round color="primary" icon="refresh" size="sm">
                    <q-tooltip>Refresh</q-tooltip>
                  </q-btn>
                </div>

                <div class="spotify-content q-mt-md">
                  <div v-if="spotifyData.topArtists?.length" class="artist-grid">
                    <div v-for="artist in spotifyData.topArtists" :key="artist.id" class="artist-item">
                      <q-img :src="artist.images?.[0]?.url || 'https://via.placeholder.com/100'" class="artist-img" />
                      <div class="artist-name">{{ artist.name }}</div>
                    </div>
                  </div>
                  <div v-else class="empty-state text-grey q-py-lg text-center">
                    <q-icon name="music_note" size="48px" color="grey-6" />
                    <div class="q-mt-sm">Connect your Spotify account to see your top artists</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card class="profile-card">
              <q-card-section>
                <div class="section-header">
                  <h5 class="text-weight-bold q-my-none">Spotify Top Songs</h5>
                  <q-btn flat round color="primary" icon="refresh" size="sm">
                    <q-tooltip>Refresh</q-tooltip>
                  </q-btn>
                </div>

                <div class="spotify-content q-mt-md">
                  <div v-if="spotifyData.topTracks?.length" class="tracks-list">
                    <q-list separator>
                      <q-item v-for="track in spotifyData.topTracks" :key="track.id" class="track-item">
                        <q-item-section avatar>
                          <q-avatar square>
                            <q-img :src="track.album?.images?.[0]?.url || 'https://via.placeholder.com/50'" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ track.name }}</q-item-label>
                          <q-item-label caption>{{ track.artists?.[0]?.name || 'Unknown Artist' }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn flat round size="sm" color="grey-6" icon="play_arrow">
                            <q-tooltip>Play on Spotify</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                  <div v-else class="empty-state text-grey q-py-lg text-center">
                    <q-icon name="queue_music" size="48px" color="grey-6" />
                    <div class="q-mt-sm">Connect your Spotify account to see your top tracks</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Account Settings Section -->
        <q-card class="profile-card q-mt-md">
          <q-card-section>
            <div class="section-header">
              <h5 class="text-weight-bold q-my-none">Account Settings</h5>
            </div>

            <div class="account-settings q-mt-md">
              <q-list>


                <q-item clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon name="delete" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-negative">Delete Account</q-item-label>
                    <q-item-label caption>Permanently delete your account and data</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn unelevated color="negative" size="sm" label="Delete" @click="confirmDeleteAccount" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Dialogs -->
    <q-dialog v-model="deleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Confirm Deletion</span>
        </q-card-section>

        <q-card-section>
          Are you sure you want to permanently delete your account? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Delete Account" color="negative" @click="deleteAccount" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="logoutDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="logout" color="primary" text-color="white" />
          <span class="q-ml-sm text-h6">Sign Out</span>
        </q-card-section>

        <q-card-section>
          Are you sure you want to sign out?
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Sign Out" color="primary" @click="signOut" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();

const userData = ref({
  username: '',
  email: '',
  profileImage: null,
  dateOfBirth: '',
  favoriteArtists: ['Billie Eilish', 'Dua Lipa', 'Ed Sheeran', 'Tate McRae', 'The Weeknd']
});

const spotifyData = ref({
  topArtists: [],
  topTracks: [],
  currentPlayback: null
});

const customArtist = ref('');
const profileImageFile = ref(null);
const deleteDialog = ref(false);
const logoutDialog = ref(false);

const removeArtist = (artist) => {
  userData.value.favoriteArtists = userData.value.favoriteArtists.filter(a => a !== artist);
  $q.notify({
    color: 'info',
    message: `Removed ${artist} from favorites`,
    position: 'bottom-right',
    timeout: 2000
  });
};

const connectSpotify = () => {
  window.location.href = 'http://localhost:5000/api/auth/spotify';
};

const confirmDeleteAccount = () => {
  deleteDialog.value = true;
};

const deleteAccount = async () => {
  try {
    const response = await axios.delete('http://localhost:5000/api/auth/delete-account', {
      withCredentials: true,
    });

    console.log('Delete account response:', response.data);

    $q.notify({
      color: 'negative',
      message: 'Account deleted successfully',
      position: 'center',
      timeout: 2000
    });

    window.location.href = '/login';
  } catch (error) {
    console.error('Failed to delete account:', error.response?.data || error.message);

    $q.notify({
      color: 'negative',
      message: 'Failed to delete account',
      position: 'center',
      timeout: 2000
    });
  }
};

const logout = () => {
  logoutDialog.value = true;
};

const signOut = async () => {
  try {
    await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });

    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    window.location.href = '/login';
  } catch (error) {
    console.error('Failed to sign out:', error.response?.data || error.message);
  }
};

async function fetchUserProfile() {
  try {
    const res = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });

    console.log("📥 User Data Fetched:", res.data);

    userData.value = {
      id: res.data.user?.id || '',
      username: res.data.user?.name || 'Guest',
      email: res.data.user?.email || '',
      profileImage: res.data.user?.profileImage || null,
      dateOfBirth: res.data.user?.dateOfBirth || '',
      favoriteArtists: res.data.user?.favoriteArtists || []
    };

    spotifyData.value = {
      topArtists: res.data.spotifyData?.topArtists || [],
      topTracks: res.data.spotifyData?.topTracks || [],
      currentPlayback: res.data.spotifyData?.currentPlayback || null
    };

  } catch (error) {
    console.error('Failed to fetch profile:', error.response?.data || error.message);
  }
}

async function addArtist() {
  if (!customArtist.value.trim()) return;

  try {
    await axios.post('http://localhost:5000/api/auth/add-artist',
      { artist: customArtist.value.trim() },
      { withCredentials: true }
    );

    userData.value.favoriteArtists.push(customArtist.value.trim());
    customArtist.value = '';

    $q.notify({
      color: 'positive',
      message: 'Artist added successfully',
      icon: 'check_circle',
      position: 'bottom-right',
      timeout: 2000
    });
  } catch (error) {
    console.error('Failed to add artist:', error.response?.data || error.message);
    $q.notify({
      color: 'negative',
      message: 'Failed to add artist',
      position: 'bottom-right',
      timeout: 2000
    });
  }
}

async function updateAccountInfo() {
  try {
    await axios.post('http://localhost:5000/api/auth/save-user-details',
      {
        username: userData.value.username,
        dateOfBirth: userData.value.dateOfBirth
      },
      { withCredentials: true }
    );

    $q.notify({
      color: 'positive',
      message: 'Profile updated successfully!',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
  } catch (error) {
    console.error('Failed to update profile:', error.response?.data || error.message);
    $q.notify({
      color: 'negative',
      message: 'Failed to update profile',
      position: 'top',
      timeout: 2000
    });
  }
}

async function uploadProfileImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('profileImage', file);

  try {
    const res = await axios.post('http://localhost:5000/api/auth/upload-profile-image', formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    userData.value.profileImage = res.data.profileImageUrl;
    $q.notify({
      color: 'positive',
      message: 'Profile image updated!',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });
  } catch (error) {
    console.error('Failed to upload profile image:', error.response?.data || error.message);
    $q.notify({
      color: 'negative',
      message: 'Failed to uploadscript',
      position: 'top',
      timeout: 2000
    });
  }
}

onMounted(fetchUserProfile);
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  position: relative;
}

.blur-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 260px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  filter: blur(0px);
  z-index: 0;
}

.profile-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 32px;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.profile-header {
  padding: 24px 0;
}

.profile-header-content {
  display: flex;
  align-items: center;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.spotify-btn {
  font-weight: 600;
  padding: 8px 16px;
}

.content-area {
  padding: 8px 0;
}

.profile-card {
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  background: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.artist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.artist-img {
  border-radius: 8px;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.artist-name {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.track-item {
  border-radius: 8px;
  transition: background-color 0.2s;
}

.track-item:hover {
  background-color: #f8f9fa;
}

.empty-state {
  display: flex;
  flex-direction: column;
  astyleitems: center;
  justify-content: center;
  padding: 24px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

@media (max-width: 768px) {
  .profile-header-content {
    flex-direction: column;
    text-align: center;
  }

  .profile-info {
    margin-left: 0;
    margin-top: 16px;
  }
}
</style>