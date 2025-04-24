<template>
  <q-page class="profile-page">
    <div class="blur-bg"></div>
    <div class="profile-container q-pa-md">
      <div class="nav-bar q-mb-lg">
        <h4 class="text-weight-bold q-my-none">MusicMatch</h4>
        <q-btn flat round color="primary" icon="logout" @click="logout">
          <q-tooltip>Sign Out</q-tooltip>
        </q-btn>
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
                <q-item clickable v-ripple @click="openPrivacySettings">
                  <q-item-section avatar>
                    <q-icon name="security" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Privacy Settings</q-item-label>
                    <q-item-label caption>Manage your privacy preferences</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon name="arrow_forward_ios" color="grey-7" size="xs" />
                  </q-item-section>
                </q-item>

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

const openPrivacySettings = () => {
  privacySettingsDialog.value = true;
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

</script>

<style lang="scss" scoped>
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
</style>