<template>
  <q-page class="profile-page">
    <div class="blur-bg"></div>
    <div class="profile-container q-pa-md">
      <div class="nav-bar q-mb-lg">
        <div class="logo-section">
          <router-link to="/swipe" class="no-decoration">
            <h4 class="text-weight-bold q-my-none cursor-pointer text-white">MusicMatch</h4>
          </router-link>
          <div class="swipe-hint" @click="goToSwipe">
            <div class="animated-arrow">
              <q-icon name="arrow_back" />
            </div>
            <span class="swipe-text">Start swiping</span>
          </div>
        </div>
        <div class="nav-buttons">
          <q-btn flat round color="primary" icon="logout" @click="logout">
            <q-tooltip>Sign Out</q-tooltip>
          </q-btn>
          <q-btn flat round :icon="isDarkMode ? 'dark_mode' : 'light_mode'" @click="toggleDarkMode" color="white">
            <q-tooltip>{{ isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}</q-tooltip>
          </q-btn>
        </div>
      </div>
      <div class="profile-header q-mb-lg">
        <div class="profile-header-content">
          <q-avatar size="120px" class="profile-avatar">
            <q-img v-if="userData.profileImage" :src="userData.profileImage" />
            <div v-else class="text-center full-width full-height flex flex-center bg-primary text-white text-h2">
              {{ (userData.username || 'G').charAt(0).toUpperCase() }}
            </div>
          </q-avatar>
          <div class="profile-info q-ml-md">
            <h2 class="text-weight-bold q-my-sm">{{ userData.username || 'Guest' }}</h2>
            <p class="text-grey-8 q-my-sm">{{ userData.email }}</p>
            <q-btn v-if="!spotifyConnected" unelevated rounded color="green" class="q-mt-sm spotify-btn"
              label="Connect Spotify" icon="fab fa-spotify" @click="connectSpotify" />
            <div v-else class="spotify-status q-mt-sm">
              <q-chip color="green" text-color="white">
                <q-avatar class="q-mr-xs">
                  <q-icon name="fab fa-spotify" />
                </q-avatar>
                Spotify Connected
              </q-chip>
            </div>
          </div>
        </div>
      </div>
      <div class="currently-playing q-mb-lg">
        <q-card class="profile-card">
          <q-card-section>
            <div class="section-header">
              <h5 class="text-weight-bold q-my-none">Currently Playing</h5>
              <q-btn flat round color="primary" icon="refresh" size="sm" @click="refreshSpotifyData">
                <q-tooltip>Refresh</q-tooltip>
              </q-btn>
            </div>

            <div v-if="spotifyData.currentPlayback" class="row items-center q-mt-md">
              <div class="col-auto">
                <q-avatar square size="80px">
                  <q-img :src="spotifyData.currentPlayback.album?.image || 'https://via.placeholder.com/80'" />
                </q-avatar>
              </div>
              <div class="col q-ml-md">
                <div class="text-h6">{{ spotifyData.currentPlayback.name || 'Unknown Track' }}</div>
                <div class="text-subtitle2">{{ spotifyData.currentPlayback.artist || 'Unknown Artist' }}</div>
                <div class="sound-wave q-mt-sm">
                  <div v-for="i in 8" :key="i" class="sound-bar"></div>
                </div>
                <q-btn flat color="green" class="q-mt-sm" icon="fab fa-spotify" label="Open in Spotify"
                  @click="playOnSpotify(spotifyData.currentPlayback.uri)" />
              </div>
            </div>

            <div v-else class="empty-state text-grey-6 q-py-lg text-center">
              <q-icon name="music_off" size="48px" color="grey-7" />
              <div class="q-mt-sm">No track currently playing</div>
              <div class="text-caption q-mt-xs">
                Start playing music on Spotify and click refresh to see what's playing
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="artist-showcase q-mb-lg">
        <div class="row items-center justify-between q-mb-sm">
          <h6 class="q-my-none">Your Artists</h6>
          <q-btn flat dense round color="primary" icon="shuffle" @click="shuffleArtistDisplay">
            <q-tooltip>Shuffle Artists</q-tooltip>
          </q-btn>
        </div>
        <div class="artist-bubbles-container">
          <div class="artist-bubbles">
            <q-avatar v-for="(artist, index) in displayedArtists" :key="index" :size="getRandomSize(index)"
              class="artist-bubble q-mr-sm">
              <q-img :src="getArtistImagePath(artist)" />
              <q-tooltip>{{ artist }}</q-tooltip>
            </q-avatar>
          </div>
        </div>
      </div>


      <div class="content-area">
        <q-card class="profile-card q-mb-md">
          <q-card-section>
            <div class="section-header">
              <h5 class="text-weight-bold q-my-none">Account Information</h5>
              <q-btn flat round color="primary" icon="edit" size="sm" @click="editingProfile = true">
                <q-tooltip>Edit Profile</q-tooltip>
              </q-btn>
            </div>

            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-md-6">
                <q-input v-model="userData.username" outlined dense label="Username" :readonly="!editingProfile">
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="userData.email" outlined dense label="Email" readonly>
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="userData.dateOfBirth" outlined dense label="Date of Birth" type="date"
                  :readonly="!editingProfile">
                  <template v-slot:prepend>
                    <q-icon name="cake" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-file v-model="profileImageFile" outlined dense label="Profile Picture" @change="uploadProfileImage"
                  :disable="!editingProfile">
                  <template v-slot:prepend>
                    <q-icon name="add_photo_alternate" />
                  </template>
                </q-file>
              </div>
            </div>

            <div class="row justify-end q-mt-md" v-if="editingProfile">
              <q-btn flat label="Cancel" class="q-mr-sm" @click="cancelEditing" />
              <q-btn color="primary" label="Save Changes" @click="updateAccountInfo" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="profile-card q-mb-md">
          <q-card-section>
            <div class="section-header">
              <h5 class="text-weight-bold q-my-none">Favorite Artists</h5>
              <q-btn flat round color="primary" icon="playlist_add" size="sm" @click="openRecommendations">
                <q-tooltip>Add from recommendations</q-tooltip>
              </q-btn>
            </div>

            <div class="artist-input q-mt-md">
              <q-input v-model="customArtist" outlined dense label="Add artist" placeholder="Add an artist you love"
                @keyup.enter="addArtist">
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
              <div v-if="!userData.favoriteArtists?.length" class="empty-state text-grey-6 q-py-md text-center">
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
                  <q-btn flat round color="primary" icon="refresh" size="sm" @click="refreshSpotifyData">
                    <q-tooltip>Refresh</q-tooltip>
                  </q-btn>
                </div>

                <div class="spotify-content q-mt-md">
                  <div v-if="spotifyData.topArtists?.length" class="artist-grid">
                    <div v-for="artist in spotifyData.topArtists" :key="artist.id" class="artist-item">
                      <q-img :src="artist.images?.[0]?.url || 'https://via.placeholder.com/100'" class="artist-img" />
                      <div class="artist-name">{{ artist.name }}</div>
                      <q-btn flat round size="xs" color="green" icon="add" @click="addArtistFromSpotify(artist.name)"
                        class="artist-add-btn">
                        <q-tooltip>Add to favorites</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                  <div v-else class="empty-state text-grey-6 q-py-lg text-center">
                    <q-icon name="music_note" size="48px" color="grey-7" />
                    <div class="q-mt-sm">Connect your Spotify account to see your top artists</div>
                    <q-btn unelevated rounded color="green" class="q-mt-md spotify-btn" label="Connect Spotify"
                      icon="fab fa-spotify" @click="connectSpotify" />
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
                  <q-btn flat round color="primary" icon="refresh" size="sm" @click="refreshSpotifyData">
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
                          <q-btn flat round size="sm" color="green" icon="play_arrow" @click="playOnSpotify(track.uri)">
                            <q-tooltip>Play on Spotify</q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                  <div v-else class="empty-state text-grey-6 q-py-lg text-center">
                    <q-icon name="queue_music" size="48px" color="grey-7" />
                    <div class="q-mt-sm">Connect your Spotify account to see your top tracks</div>
                    <q-btn unelevated rounded color="green" class="q-mt-md spotify-btn" label="Connect Spotify"
                      icon="fab fa-spotify" @click="connectSpotify" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-card class="profile-card q-mt-md">
          <q-card-section>
            <div class="section-header">
              <h5 class="text-weight-bold q-my-none">Account Settings</h5>
            </div>

            <div class="account-settings q-mt-md">
              <q-list>


                <q-item clickable v-ripple @click="confirmDeleteAccount">
                  <q-item-section avatar>
                    <q-icon name="delete" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-negative">Delete Account</q-item-label>
                    <q-item-label caption>Permanently delete your account and data</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn unelevated color="negative" size="sm" label="Delete" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

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
          <q-btn flat label="Delete Account" color="negative" @click="requestAccountDeletion" v-close-popup />
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

    <q-dialog v-model="recommendationsDialog">
      <q-card style="width: 700px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Recommended Artists</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div v-for="artist in recommendedArtists" :key="artist.name" class="col-4 col-sm-3">
              <q-card flat class="recommendation-card">
                <q-img :src="artist.image" ratio="1" />
                <q-card-section class="q-pa-sm">
                  <div class="text-subtitle2">{{ artist.name }}</div>
                  <div class="text-caption text-grey-7">{{ artist.genre }}</div>
                </q-card-section>
                <q-card-actions align="right" class="q-pa-xs">
                  <q-btn flat round color="primary" icon="add" @click="addArtistFromRecommendation(artist.name)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="privacySettingsDialog">
      <q-card style="width: 500px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Privacy Settings</div>
        </q-card-section>

        <q-card-section>
          <q-list>
            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Public Profile</q-item-label>
                <q-item-label caption>Allow others to find your profile</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="privacySettings.publicProfile" color="primary" />
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Show Music Activity</q-item-label>
                <q-item-label caption>Display your currently playing tracks</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="privacySettings.showActivity" color="primary" />
              </q-item-section>
            </q-item>

            <q-item tag="label" v-ripple>
              <q-item-section>
                <q-item-label>Allow Messages</q-item-label>
                <q-item-label caption>Let others send you direct messages</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="privacySettings.allowMessages" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="savePrivacySettings" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();
const isDarkMode = ref(false);

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value);
  document.body.classList.toggle('dark-mode', isDarkMode.value);
  localStorage.setItem('musicmatch-darkmode', isDarkMode.value ? '1' : '0');

  // Notify the user about mode change
  $q.notify({
    message: isDarkMode.value ? 'Dark mode activated' : 'Light mode activated',
    color: isDarkMode.value ? 'dark' : 'light',
    position: 'top',
  });
}

onMounted(() => {
  const savedDark = localStorage.getItem('musicmatch-darkmode');
  isDarkMode.value = savedDark === '1';
  document.documentElement.classList.toggle('dark-mode', isDarkMode.value);
  document.body.classList.toggle('dark-mode', isDarkMode.value);
});

const artistImageMap = {
  'Billie Eilish': 'billie.jpg',
  'Dua Lipa': 'dualipa.jpg',
  'Ed Sheeran': 'edsheeran.jpg',
  'Tate McRae': 'tate.jpg',
  'The Weeknd': 'weeknd.jpg',
  'Taylor Swift': 'taylor.jpg',
  'Ariana Grande': 'ariana.jpg',
  'Bad Bunny': 'badbunny.jpg',
  'Beyonce': 'beyonce.jpg',
  'Drake': 'drake.jpg',
  'Kendrick Lamar': 'kendrick.jpg',
  'Rihanna': 'rihanna.jpg',
  'SZA': 'sza.jpg',
  'BTS': 'bts.jpg',
  'Harry Styles': 'harry.jpg',
};

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
const recommendationsDialog = ref(false);
const privacySettingsDialog = ref(false);
const editingProfile = ref(false);
const displayedArtists = ref([]);

const recommendedArtists = ref([
  { name: 'Olivia Rodrigo', image: 'https://via.placeholder.com/150', genre: 'Pop' },
  { name: 'Post Malone', image: 'https://via.placeholder.com/150', genre: 'Hip-Hop/Pop' },
  { name: 'Coldplay', image: 'https://via.placeholder.com/150', genre: 'Alternative/Rock' },
  { name: 'Lana Del Rey', image: 'https://via.placeholder.com/150', genre: 'Alternative/Pop' },
  { name: 'Imagine Dragons', image: 'https://via.placeholder.com/150', genre: 'Rock/Pop' },
  { name: 'Adele', image: 'https://via.placeholder.com/150', genre: 'Pop/Soul' },
  { name: 'Tyler, The Creator', image: 'https://via.placeholder.com/150', genre: 'Hip-Hop/Rap' },
  { name: 'Frank Ocean', image: 'https://via.placeholder.com/150', genre: 'R&B/Soul' },
  { name: 'Arctic Monkeys', image: 'https://via.placeholder.com/150', genre: 'Indie Rock' }
]);

const privacySettings = ref({
  publicProfile: true,
  showActivity: true,
  allowMessages: true
});

const shuffleArtistDisplay = () => {
  console.log("Shuffling artists:", userData.value.favoriteArtists);

  if (!userData.value.favoriteArtists || userData.value.favoriteArtists.length === 0) {
    displayedArtists.value = [];
    return;
  }

  const allArtists = [...userData.value.favoriteArtists];
  const shuffled = allArtists.sort(() => 0.5 - Math.random());
  displayedArtists.value = shuffled.slice(0, Math.min(10, shuffled.length));

  console.log("Displayed artists after shuffle:", displayedArtists.value);
};

const getRandomSize = (index) => {
  const sizes = ['36px', '44px', '52px', '40px', '48px'];
  return sizes[index % sizes.length];
};

const getArtistImagePath = (artist) => {
  if (artistImageMap[artist]) {
    return new URL(`../assets/images/${artistImageMap[artist]}`, import.meta.url).href;
  }

  const hash = artist.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const hue = hash % 360;
  const backgroundColor = `hsl(${hue}, 70%, 60%)`;
  const textColor = '#FFFFFF';
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = textColor;
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(artist.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
};
const spotifyConnected = computed(() => {
  return spotifyData.value.topArtists?.length > 0 ||
    spotifyData.value.topTracks?.length > 0 ||
    userData.value.spotifyToken;
});
const removeArtist = async (artist) => {
  try {
    await axios.post('http://localhost:5000/api/auth/remove-artist', { artist }, { withCredentials: true });

    userData.value.favoriteArtists = userData.value.favoriteArtists.filter(a => a !== artist);
    shuffleArtistDisplay();

    $q.notify({
      color: 'info',
      message: `Removed ${artist} from favorites`,
      position: 'bottom-right',
      timeout: 2000
    });
  } catch (error) {
    console.error('Failed to remove artist:', error.response?.data || error.message);
    $q.notify({
      color: 'negative',
      message: 'Failed to remove artist',
      position: 'bottom-right',
      timeout: 2000
    });
  }
};

const connectSpotify = () => {
  window.location.href = 'http://localhost:5000/api/auth/spotify';
};

const playOnSpotify = (uri) => {
  if (!uri) return;

  const spotifyUrl = `https://open.spotify.com/track/${uri.split(':')[2]}`;
  window.open(spotifyUrl, '_blank');
};

const confirmDeleteAccount = () => {
  deleteDialog.value = true;
};

const requestAccountDeletion = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/auth/request-account-deletion',
      {},
      { withCredentials: true }
    );

    console.log('Account deletion requested:', response.data);

    $q.notify({
      color: 'info',
      message: 'Confirmation email sent. Please check your inbox.',
      position: 'center',
      timeout: 4000,
    });
  } catch (error) {
    console.error('Error requesting account deletion:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to request account deletion.',
      position: 'center',
      timeout: 3000,
    });
  }
};



const openRecommendations = () => {
  recommendationsDialog.value = true;
};



const savePrivacySettings = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));

    $q.notify({
      color: 'positive',
      message: 'Privacy settings updated',
      position: 'bottom-right',
      timeout: 2000
    });
  } catch {
    $q.notify({
      color: 'negative',
      message: 'Failed to update privacy settings',
      position: 'bottom-right',
      timeout: 2000
    });
  }
};

const refreshSpotifyData = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/auth/refresh-spotify-data', { withCredentials: true });

    if (res.data.spotifyData) {
      spotifyData.value = res.data.spotifyData;

      $q.notify({
        color: 'positive',
        message: 'Spotify data refreshed',
        position: 'bottom-right',
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('Failed to refresh Spotify data:', error);
    $q.notify({
      color: 'negative',
      message: 'Failed to refresh Spotify data',
      position: 'bottom-right',
      timeout: 2000
    });
  }
};

const addArtistFromSpotify = (artist) => {
  if (!artist || userData.value.favoriteArtists.includes(artist)) {
    return $q.notify({
      color: 'info',
      message: `${artist} is already in your favorites`,
      position: 'bottom-right',
      timeout: 2000
    });
  }

  addArtistToFavorites(artist);
};

const addArtistFromRecommendation = (artist) => {
  if (!artist || userData.value.favoriteArtists.includes(artist)) {
    return $q.notify({
      color: 'info',
      message: `${artist} is already in your favorites`,
      position: 'bottom-right',
      timeout: 2000
    });
  }

  addArtistToFavorites(artist);
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

const cancelEditing = () => {
  editingProfile.value = false;
};

async function fetchUserProfile() {
  try {
    const res = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });

    if (!res.data?.user?.id) {
      throw new Error('No user found');
    }

    const user = res.data.user || {};

    let formattedDateOfBirth = '';
    if (user.dateOfBirth) {
      const date = new Date(user.dateOfBirth);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      formattedDateOfBirth = `${year}-${month}-${day}`;
    }
    console.log("Raw user:", user);

    userData.value = {
      id: user.id || '',
      username: user.name || 'Guest',
      email: user.email || '',
      profileImage: user.profileImage || null,
      dateOfBirth: formattedDateOfBirth,
      favoriteArtists: user.favoriteArtists || [],
      spotifyToken: user.spotifyToken
    };

    spotifyData.value = {
      topArtists: res.data.spotifyData?.topArtists || [],
      topTracks: res.data.spotifyData?.topTracks || [],
      currentPlayback: res.data.spotifyData?.currentPlayback || null
    };

    shuffleArtistDisplay();

  } catch (error) {
    console.warn('🔁 Redirecting to login because profile failed:', error.message);
    window.location.href = '/login';
  }
}


async function addArtist() {
  if (!customArtist.value.trim()) return;

  const artist = customArtist.value.trim();
  addArtistToFavorites(artist);
  customArtist.value = '';
}


async function addArtistToFavorites(artist) {
  try {
    await axios.post('http://localhost:5000/api/auth/add-artist',
      { artist: artist },
      { withCredentials: true }
    );

    if (!userData.value.favoriteArtists.includes(artist)) {
      userData.value.favoriteArtists.push(artist);
      shuffleArtistDisplay();
    }

    $q.notify({
      color: 'positive',
      message: `${artist} added to favorites`,
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
    console.log('Saving username:', userData.value.username);

    const response = await axios.post(
      'http://localhost:5000/api/auth/save-user-details',
      {
        username: userData.value.username,
        dateOfBirth: userData.value.dateOfBirth
      },
      { withCredentials: true }
    );

    console.log('Server response:', response.data);

    if (response.data && response.data.user) {
      userData.value.username = response.data.user.username || userData.value.username;
    }

    editingProfile.value = false;

    $q.notify({
      color: 'positive',
      message: 'Profile updated successfully!',
      icon: 'check_circle',
      position: 'top',
      timeout: 2000
    });

    await fetchUserProfile();

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
      message: 'Failed to upload profile image',
      position: 'top',
      timeout: 2000
    });
  }
}

onMounted(() => {
  fetchUserProfile();
  setInterval(fetchUserProfile, 10000);
});

const goToSwipe = () => {
  window.location.href = '/swipe';
};
</script>

<style lang="scss">
.profile-page {
  position: relative;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.blur-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 220px;
  background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
  z-index: 0;
}

.profile-container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 8px 0;
}

.profile-header {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-header-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.artist-bubbles-container {
  overflow-x: auto;
  padding: 8px 0;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
}

.artist-bubbles {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 0;
}

.artist-bubble {
  transition: transform 0.2s;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.artist-bubble:hover {
  transform: scale(1.1);
  z-index: 1;
}

.artist-bubble img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 16px;
}

.artist-item {
  position: relative;
  text-align: center;
}

.artist-img {
  border-radius: 8px;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.artist-name {
  font-size: 12px;
  margin-top: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-add-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.tracks-list {
  max-height: 320px;
  overflow-y: auto;
}

.spotify-btn {
  padding-left: 12px;
  padding-right: 16px;

  &:before {
    margin-right: 8px;
  }
}

.recommendation-card {
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
  }
}

.empty-state {
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 767px) {
  .profile-header-content {
    flex-direction: column;
    text-align: center;
  }

  .profile-info {
    margin-left: 0;
    margin-top: 16px;
  }
}

.currently-playing {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.currently-playing:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.sound-wave {
  display: flex;
  align-items: center;
  height: 20px;
  gap: 3px;
}

.sound-bar {
  width: 3px;
  height: 100%;
  background-color: #1DB954;
  border-radius: 2px;
  animation: sound-wave-animation 1s infinite;
}

.sound-bar:nth-child(1) {
  animation-delay: 0.0s;
}

.sound-bar:nth-child(2) {
  animation-delay: 0.1s;
}

.sound-bar:nth-child(3) {
  animation-delay: 0.2s;
}

.sound-bar:nth-child(4) {
  animation-delay: 0.3s;
}

.sound-bar:nth-child(5) {
  animation-delay: 0.4s;
}

.sound-bar:nth-child(6) {
  animation-delay: 0.5s;
}

.sound-bar:nth-child(7) {
  animation-delay: 0.6s;
}

.sound-bar:nth-child(8) {
  animation-delay: 0.7s;
}

@keyframes sound-wave-animation {

  0%,
  100% {
    height: 4px;
  }

  50% {
    height: 20px;
  }
}

/* Add at the end of your style block */
/* Dark Mode Variables and Base Styles */
:root.dark-mode,
.dark-mode {
  --bg-main: #181825;
  --bg-gradient: linear-gradient(135deg, #181825 0%, #312e81 100%);
  --bg-card: #232136;
  --bg-card-hover: #2a273f;
  --text-main: #e0e7ff;
  --text-secondary: #a5b4fc;
  --text-highlight: #fef3c7;
  --accent: #8b5cf6;
  --accent-light: #a78bfa;
  --accent-glow: rgba(139, 92, 246, 0.4);
  --border: rgba(139, 92, 246, 0.2);
}

/* Main Page Background */
.dark-mode .profile-page {
  background: var(--bg-gradient) !important;
}

/* Header Area Background */
.dark-mode .blur-bg {
  background: linear-gradient(135deg, #4c1d95 0%, #312e81 100%) !important;
  opacity: 0.8;
}

/* Card Containers */
.dark-mode .profile-header,
.dark-mode .profile-card,
.dark-mode .currently-playing {
  background: linear-gradient(145deg, #232136, #2a273f) !important;
  color: var(--text-main) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--border),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  border-radius: 16px !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.dark-mode .profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.3),
    0 0 20px rgba(139, 92, 246, 0.2) !important;
}

/* Avatar Styling */
.dark-mode .profile-avatar {
  border: 4px solid var(--bg-card) !important;
  box-shadow: 0 0 0 2px var(--accent-light),
    0 8px 24px rgba(0, 0, 0, 0.3) !important;
}

/* Text Colors */
.dark-mode .text-weight-bold,
.dark-mode .text-h6,
.dark-mode .text-subtitle2,
.dark-mode h2,
.dark-mode h3,
.dark-mode h4,
.dark-mode h5,
.dark-mode h6,
.dark-mode .q-item-label,
.dark-mode .nav-bar,
.dark-mode .section-header h5,
.dark-mode .artist-name {
  color: var(--text-main) !important;
}

.dark-mode .text-grey-8,
.dark-mode .text-caption {
  color: var(--text-secondary) !important;
}

/* Input Fields */
.dark-mode .q-input,
.dark-mode .q-field__control,
.dark-mode .q-field__native {
  background-color: rgba(30, 27, 75, 0.7) !important;
  color: var(--text-main) !important;
  border: 1px solid var(--border) !important;
  border-radius: 8px;
}

.dark-mode .q-field__label {
  color: var(--text-secondary) !important;
}

/* Artists Bubbles */
.dark-mode .artist-bubble {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--bg-card);
}

.dark-mode .artist-bubble:hover {
  box-shadow: 0 0 0 2px var(--accent-light),
    0 8px 16px rgba(0, 0, 0, 0.4);
}

/* Artist Grid Styling */
.dark-mode .artist-grid {
  gap: 20px;
}

.dark-mode .artist-item {
  background: linear-gradient(145deg, #232136, #2a273f) !important;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dark-mode .artist-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3),
    0 0 0 1px var(--accent-light) !important;
}

.dark-mode .artist-img {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dark-mode .artist-add-btn {
  background: var(--accent) !important;
  color: white !important;
}

/* Empty States */
.dark-mode .empty-state {
  background-color: rgba(30, 27, 75, 0.3) !important;
  border: 1px solid var(--border);
  color: var(--text-secondary) !important;
}

.dark-mode .empty-state .q-icon {
  color: var(--accent-light) !important;
}

/* Buttons */
.dark-mode .q-btn {
  border-radius: 8px;
}

.dark-mode .q-btn.q-btn--standard {
  background: linear-gradient(135deg, #4c1d95, #6d28d9) !important;
  color: white !important;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.dark-mode .q-btn.q-btn--flat {
  color: var(--accent-light) !important;
}

/* Chips */
.dark-mode .q-chip {
  background: linear-gradient(145deg, #3730a3, #4338ca) !important;
  color: white !important;
  border: none !important;
}
.dark-mode .q-card,
.dark-mode .profile-card,
.dark-mode .currently-playing {
  background: linear-gradient(145deg, #232136, #2a273f) !important;
  color: var(--text-main) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--border), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  transition: background 0.3s, color 0.3s;
}

/* Lists and Items */
.dark-mode .q-list {
  background: transparent !important;
  border: 1px solid var(--border);
  border-radius: 8px;
}

.dark-mode .q-item {
  color: var(--text-main) !important;
  border-bottom: 1px solid var(--border);
}

.dark-mode .q-item:last-child {
  border-bottom: none;
}

/* Track List Styling */
.dark-mode .track-item {
  background: linear-gradient(145deg, #232136, #2a273f) !important;
  border: 1px solid var(--border);
  border-radius: 8px !important;
  margin-bottom: 8px;
  overflow: hidden;
}

/* Sound Wave Animation */
.dark-mode .sound-bar {
  background-color: var(--accent) !important;
  box-shadow: 0 0 8px var(--accent-glow);
}

/* Dialog Styling */
.dark-mode .q-dialog__inner>div {
  background: linear-gradient(145deg, #232136, #2a273f) !important;
  color: var(--text-main) !important;
  border: 1px solid var(--border);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5) !important;
}

/* Scrollbars */
.dark-mode ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dark-mode ::-webkit-scrollbar-track {
  background: #1e1b4b;
  border-radius: 8px;
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: #6d28d9;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

/* Transitions */
.dark-mode .profile-header,
.dark-mode .profile-card,
.dark-mode .currently-playing,
.dark-mode .track-item,
.dark-mode .artist-item,
.dark-mode .q-btn,
.dark-mode .q-chip,
.dark-mode .empty-state {
  transition: all 0.3s ease;
}
/* Logo section with animated hint */
/* Logo section with animated hint */
.logo-section {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.swipe-hint {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  padding: 12px 20px;
  border-radius: 30px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.swipe-hint::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

.swipe-hint:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1));
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    0 0 20px rgba(255, 255, 255, 0.3);
}

.swipe-hint:hover::before {
  animation: shimmer-fast 0.8s ease-in-out;
}

.swipe-hint:active {
  transform: translateY(0px) scale(0.98);
  transition: all 0.1s ease;
}

.animated-arrow {
  color: #fbbf24;
  font-size: 20px;
  animation: arrow-pulse 2.5s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
  transition: all 0.3s ease;
}

.swipe-hint:hover .animated-arrow {
  animation: arrow-bounce 0.6s ease-in-out;
  color: #f59e0b;
  filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.8));
}

.swipe-text {
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes shimmer-fast {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes arrow-pulse {
  0%, 100% {
    transform: translateX(0px) scale(1);
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
  }
  50% {
    transform: translateX(-6px) scale(1.1);
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.9));
  }
}

@keyframes arrow-bounce {
  0%, 100% {
    transform: translateX(0px) scale(1);
  }
  25% {
    transform: translateX(-8px) scale(1.15);
  }
  50% {
    transform: translateX(-4px) scale(1.05);
  }
  75% {
    transform: translateX(-6px) scale(1.1);
  }
}

/* Dark mode styling for the hint */
.dark-mode .swipe-hint {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(76, 29, 149, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.4);
  box-shadow: 
    0 8px 32px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 20px rgba(139, 92, 246, 0.15);
}

.dark-mode .swipe-hint::before {
  background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent);
}

.dark-mode .swipe-hint:hover {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.35), rgba(76, 29, 149, 0.2));
  box-shadow: 
    0 12px 40px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 0 30px rgba(139, 92, 246, 0.4);
}

.dark-mode .animated-arrow {
  color: var(--accent-light);
  filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.8));
}

.dark-mode .swipe-hint:hover .animated-arrow {
  color: #c4b5fd;
  filter: drop-shadow(0 0 16px rgba(196, 181, 253, 0.9));
}

.dark-mode .swipe-text {
  color: rgba(224, 231, 255, 0.95);
  text-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}
</style>