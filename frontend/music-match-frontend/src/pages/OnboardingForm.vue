<template>
  <q-page class="flex flex-center column bg-grey-1">
    <div class="onboarding-wrapper">
      <div class="onboarding-container">
        <div class="header-section q-pa-md">
          <h1 class="text-h3 text-bold gradient-text">MusicMatch</h1>
          <p class="text-subtitle2 text-grey-7 q-mb-none">Find your sound. Connect with your tribe.</p>
        </div>

        <q-form @submit="saveOnboardingData" class="form-content q-px-md q-pb-md">
          <div class="form-section">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="username" label="Username" filled color="primary" bg-color="white"
                  class="modern-input" :rules="[val => !!val || 'Username is required']">
                  <template v-slot:prepend>
                    <q-icon name="person" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="dateOfBirth" label="Date of Birth" filled color="primary" bg-color="white" type="date"
                  class="modern-input" :rules="[validateAge]">
                  <template v-slot:prepend>
                    <q-icon name="event" color="primary" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <div class="form-section profile-upload-section">
            <div class="row items-center justify-between">
              <div class="col-12 col-md-4">
                <div class="text-subtitle1 text-weight-medium text-primary q-mb-sm">Profile Picture</div>
                <div class="upload-preview">
                  <q-avatar size="100px" class="profile-avatar">
                    <img v-if="previewImage" :src="previewImage">
                    <div v-else class="flex flex-center full-height">
                      <q-icon name="add_a_photo" size="36px" color="primary" />
                    </div>
                  </q-avatar>
                </div>
              </div>
              <div class="col-12 col-md-8 q-pl-md">
                <q-file v-model="profileImage" label="Drop file here or click to upload" filled color="primary"
                  bg-color="white" accept="image/*" class="modern-input" @update:model-value="previewImageFile"
                  style="height: 100px" counter>
                  <template v-slot:prepend>
                    <q-icon name="cloud_upload" color="primary" />
                  </template>
                  <template v-slot:hint>
                    <span class="text-caption">JPG, PNG or GIF • Max 5MB</span>
                  </template>
                </q-file>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <div class="text-subtitle1 text-weight-medium text-primary q-mb-xs">Your Music Vibe</div>
              <div class="text-caption text-grey-7">Select artists that match your taste</div>
            </div>

            <div class="artists-grid">
              <div v-for="artist in exampleArtists" :key="artist.name" class="artist-tile"
                :class="{ 'artist-selected': favoriteArtists.includes(artist.name) }"
                @click="toggleArtist(artist.name)">
                <div class="artist-image-container">
                  <img :src="artist.image" class="artist-image" />
                  <div class="artist-overlay">
                    <q-icon name="check_circle" size="28px" v-if="favoriteArtists.includes(artist.name)" />
                  </div>
                </div>
                <div class="artist-info">
                  <div class="artist-name">{{ artist.name }}</div>
                  <div class="artist-genre">{{ artist.genre }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="text-subtitle1 text-weight-medium text-primary q-mb-sm">Add Your Own Artists</div>
            <div class="row items-center q-gutter-sm">
              <q-input v-model="artistInput" placeholder="Enter artist name" filled color="primary" bg-color="white"
                class="col modern-input" @keyup.enter="addArtist(artistInput)">
                <template v-slot:append>
                  <q-btn round flat color="primary" icon="add" @click="addArtist(artistInput)"
                    :disable="!artistInput.trim()" />
                </template>
              </q-input>
            </div>
            <div class="form-section">
              <div class="section-header">
                <div class="text-subtitle1 text-weight-medium text-primary q-mb-xs">Your Favorite Genres</div>
                <div class="text-caption text-grey-7">Select genres you enjoy most</div>
              </div>

              <div class="row q-col-gutter-sm q-mb-sm">
                <q-chip v-for="genre in genreOptions" :key="genre" clickable
                  :class="{ 'bg-primary text-white': favoriteGenres.includes(genre) }" @click="toggleGenre(genre)">
                  {{ genre }}
                </q-chip>
              </div>
            </div>

            <div class="selected-artists q-mt-md" v-if="favoriteArtists.length">
              <div class="text-caption text-grey-7 q-mb-xs">Selected Artists</div>
              <div class="row q-gutter-xs">
                <q-chip v-for="(artist, index) in favoriteArtists" :key="index" removable color="primary"
                  text-color="white" square size="sm" class="artist-chip" @remove="removeArtist(index)">
                  {{ artist }}
                </q-chip>
              </div>
            </div>
          </div>

          <div class="form-section q-mt-md">
            <q-btn type="submit" class="submit-btn" :loading="loading" :disable="!isFormValid">
              <span class="text-subtitle2">Start Your Journey</span>
              <q-icon name="arrow_forward" class="q-ml-sm" size="xs" />
            </q-btn>
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const username = ref('');
const dateOfBirth = ref('');
const profileImage = ref(null);
const previewImage = ref(null);
const email = ref('');
const favoriteArtists = ref([]);
const artistInput = ref('');
const loading = ref(false);

const genreOptions = [
  'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical', 'EDM', 'Indie', 'K-Pop',
  'Metal', 'Funk', 'Reggaeton', 'Country', 'Soul', 'House', 'Trap', 'Techno',
  'Drill', 'Latin', 'Blues', 'Afrobeats'
];

const favoriteGenres = ref([]);

const toggleGenre = (genre) => {
  const i = favoriteGenres.value.indexOf(genre);
  if (i === -1) favoriteGenres.value.push(genre);
  else favoriteGenres.value.splice(i, 1);
};
const exampleArtists = [
  { name: 'Billie Eilish', image: '/src/assets/images/billie.jpg', genre: 'Pop' },
  { name: 'Dua Lipa', image: '/src/assets/images/dualipa.jpg', genre: 'Dance Pop' },
  { name: 'Ed Sheeran', image: '/src/assets/images/edsheeran.jpg', genre: 'Pop' },
  { name: 'Tate McRae', image: '/src/assets/images/tate.jpg', genre: 'Pop/R&B' },
  { name: 'The Weeknd', image: '/src/assets/images/weeknd.jpg', genre: 'R&B/Pop' },
  { name: 'Taylor Swift', image: '/src/assets/images/taylor.jpg', genre: 'Pop/Country' },
  { name: 'Drake', image: '/src/assets/images/drake.jpg', genre: 'Hip Hop/Rap' },
  { name: 'Beyoncé', image: '/src/assets/images/beyonce.jpg', genre: 'R&B/Pop' },
  { name: 'Bad Bunny', image: '/src/assets/images/badbunny.jpg', genre: 'Reggaeton' },
  { name: 'Ariana Grande', image: '/src/assets/images/ariana.jpg', genre: 'Pop/R&B' },
  { name: 'BTS', image: '/src/assets/images/bts.jpg', genre: 'K-Pop' },
  { name: 'Kendrick Lamar', image: '/src/assets/images/kendrick.jpg', genre: 'Hip Hop' },
  { name: 'Rihanna', image: '/src/assets/images/rihanna.jpg', genre: 'R&B/Pop' },
  { name: 'Harry Styles', image: '/src/assets/images/harry.jpg', genre: 'Pop Rock' },
  { name: 'SZA', image: '/src/assets/images/sza.jpg', genre: 'R&B' }
];

const isFormValid = computed(() => {
  return username.value.trim() &&
    dateOfBirth.value &&
    validateAge(dateOfBirth.value) === true &&
    favoriteArtists.value.length > 0;
});

const toggleArtist = (artist) => {
  const index = favoriteArtists.value.indexOf(artist);
  if (index === -1) {
    favoriteArtists.value.push(artist);
  } else {
    favoriteArtists.value.splice(index, 1);
  }
};

const addArtist = (artist) => {
  const trimmedArtist = artist.trim();
  if (trimmedArtist && !favoriteArtists.value.includes(trimmedArtist)) {
    favoriteArtists.value.push(trimmedArtist);
    artistInput.value = '';
  }
};

const removeArtist = (index) => {
  favoriteArtists.value.splice(index, 1);
};

const previewImageFile = () => {
  if (profileImage.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
    };
    reader.readAsDataURL(profileImage.value);
  } else {
    previewImage.value = null;
  }
};

const saveOnboardingData = async () => {
  loading.value = true;

  try {
    const formData = new FormData();
    formData.append('username', username.value.trim());
    formData.append('dateOfBirth', dateOfBirth.value);
    formData.append('email', email.value.trim());
    formData.append('favoriteGenres', JSON.stringify(favoriteGenres.value));

    if (profileImage.value instanceof File) {
      formData.append('profileImage', profileImage.value);
    }

    formData.append('favoriteArtists', JSON.stringify(favoriteArtists.value));

    console.log("Sending Onboarding Data:", Object.fromEntries(formData.entries()));

    const res = await axios.post('http://localhost:5000/api/auth/save-onboarding-data',
      formData,
      { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
    );

    console.log("Onboarding Response:", res.data);

    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to save data:', error.response?.data || error.message);
  } finally {
    loading.value = false;
  }
};

const validateAge = (val) => {
  if (!val) return 'Date of birth is required';
  const birthDate = new Date(val);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 18 || (age === 18 && today < new Date(birthDate.setFullYear(today.getFullYear())))) {
    return 'You must be at least 18 years old to use this app.';
  }
  return true;
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });

    if (response.data.user) {
      const user = response.data.user;

      if (!user.isNewUser) {
        console.log('User already onboarded, redirecting to dashboard.');
        router.push('/dashboard');
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);

    if (error.response?.status === 401) {
      router.push('/login');
    }
  }
});
</script>

<style scoped>
.onboarding-wrapper {
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  background: linear-gradient(to bottom, #f7f7f9 0%, #e8e8f0 100%);
}

.onboarding-container {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header-section {
  padding-bottom: 20px;
  position: relative;
  background: radial-gradient(circle at top right, rgba(130, 36, 227, 0.1) 0%, rgba(250, 250, 252, 0.8) 70%);
  overflow: hidden;
}

.header-section::after {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(45deg, #8224e3, #4a00e0);
  filter: blur(60px);
  opacity: 0.2;
  z-index: -1;
}

.gradient-text {
  background: linear-gradient(90deg, #8224e3, #4a90e2, #8224e3);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine 3s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

.form-content {
  position: relative;
  z-index: 1;
}

.form-section {
  margin-bottom: 24px;
  position: relative;
}

.section-header {
  margin-bottom: 16px;
}

.modern-input {
  border-radius: 8px;
}

.modern-input :deep(.q-field__control) {
  border-radius: 8px;
  height: 46px;
  background: #ffffff !important;
  border: 1px solid #e0e0e6;
}

.modern-input :deep(.q-field__label) {
  top: 14px;
  font-weight: 500;
  color: #666;
}

.upload-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.profile-avatar {
  border: 2px solid #8224e3;
  background: #f5f5f5;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.artist-tile {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f7;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.artist-tile:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.artist-image-container {
  position: relative;
  height: 140px;
  overflow: hidden;
}

.artist-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.artist-tile:hover .artist-image {
  transform: scale(1.05);
}

.artist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0);
  transition: background 0.3s ease;
}

.artist-selected .artist-overlay {
  background: rgba(130, 36, 227, 0.2);
}

.artist-selected {
  border: 2px solid #8224e3;
  box-shadow: 0 0 15px rgba(130, 36, 227, 0.3);
}

.artist-info {
  padding: 8px;
  position: relative;
}

.artist-name {
  color: #333;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.artist-genre {
  color: #777;
  font-size: 11px;
}

.artist-chip {
  font-weight: 500;
  background: linear-gradient(45deg, #8224e3, #4a00e0);
  transition: all 0.3s ease;
}

.artist-chip:hover {
  box-shadow: 0 0 10px rgba(130, 36, 227, 0.3);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  background: linear-gradient(45deg, #8224e3, #4a00e0);
  color: white;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  box-shadow: 0 0 20px rgba(130, 36, 227, 0.4);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 10px;
  }

  .artist-image-container {
    height: 120px;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 480px) {
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 8px;
  }

  .artist-image-container {
    height: 100px;
  }
}
</style>