<template>
  <q-page class="flex flex-center column bg-grey-1">
    <div class="onboarding-container q-pa-none">
      <div class="header-section text-center q-pa-lg">
        <h1 class="text-h3 text-weight-bold text-primary q-mb-md">Welcome to MusicMatch!</h1>
        <p class="text-subtitle1 q-mb-lg text-grey-8">Let's set up your profile to find your music connections</p>
      </div>

      <q-form @submit="saveOnboardingData" class="q-px-lg q-pb-lg">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input v-model="username" label="Username" outlined class="text-subtitle1"
              :rules="[val => !!val || 'Username is required']" />
          </div>
          <div class="col-12 col-md-6">
            <q-input v-model="dateOfBirth" label="Date of Birth" outlined type="date" class="text-subtitle1"
              :rules="[validateAge]" />
          </div>
        </div>

        <div class="profile-pic-section q-my-md">
          <div class="text-subtitle1 q-mb-sm text-weight-medium">Profile Picture</div>
          <div class="row items-center">
            <q-avatar size="80px" class="q-mr-md bg-grey-3">
              <img v-if="previewImage" :src="previewImage">
              <q-icon v-else name="person" size="60px" color="grey-6" />
            </q-avatar>
            <q-file v-model="profileImage" label="Upload Profile Picture" accept="image/*" outlined
              @update:model-value="previewImageFile" style="max-width: 300px">
              <template v-slot:prepend>
                <q-icon name="cloud_upload" color="primary" />
              </template>
              <template v-slot:hint>
                Recommended: Square image, 500x500px
              </template>
            </q-file>
          </div>
        </div>

        <div class="music-preferences-section q-mt-xl">
          <h2 class="text-h5 text-weight-bold q-mb-md">Your Music Preferences</h2>

          <div class="q-mb-lg">
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Select Your Favorite Artists</div>
            <p class="text-caption text-grey-8 q-mb-md">Click on artists you like or add your own below</p>

            <div class="artists-grid">
              <q-card v-for="artist in exampleArtists" :key="artist.name" class="artist-card"
                :class="{ 'artist-selected': favoriteArtists.includes(artist.name) }" @click="toggleArtist(artist.name)">
                <q-img :src="artist.image" class="artist-img" />
                <div class="artist-overlay">
                  <q-icon name="check_circle" size="28px" v-if="favoriteArtists.includes(artist.name)" />
                </div>
                <div class="artist-name-container q-pa-sm">
                  <p class="artist-name text-weight-medium">{{ artist.name }}</p>
                  <p class="artist-genre text-caption">{{ artist.genre }}</p>
                </div>
              </q-card>
            </div>
          </div>

          <div class="q-mb-xl">
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Add Your Own Artists</div>
            <div class="row items-center q-gutter-sm">
              <q-input v-model="artistInput" label="Artist name" outlined dense class="col"
                hint="Press enter or click + to add" @keyup.enter="addArtist(artistInput)" />
              <q-btn color="primary" icon="add" round @click="addArtist(artistInput)" :disable="!artistInput.trim()" />
            </div>

            <div class="selected-artists q-mt-md">
              <div class="text-subtitle1 text-weight-medium q-mb-sm" v-if="favoriteArtists.length">Your Selected Artists
              </div>
              <div class="row q-gutter-sm">
                <q-chip v-for="(artist, index) in favoriteArtists" :key="index" removable color="primary"
                  text-color="white" @remove="removeArtist(index)">
                  {{ artist }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>

        <q-btn type="submit" color="primary" label="Complete Setup" class="full-width q-py-sm text-subtitle1"
          :loading="loading" :disable="!isFormValid" />
      </q-form>
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
.onboarding-container {
  max-width: 900px;
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin: 40px 20px;
}

.header-section {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.artist-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.artist-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.artist-selected {
  border: 3px solid #1976D2;
  transform: translateY(-5px);
}

.artist-img {
  height: 150px;
  object-fit: cover;
}

.artist-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  color: #1976D2;
}

.artist-name-container {
  background: white;
}

.artist-name {
  margin: 0;
  font-size: 14px;
  line-height: 1.2;
}

.artist-genre {
  margin: 0;
  color: #666;
}

.selected-artists {
  min-height: 50px;
}

@media (max-width: 600px) {
  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }

  .artist-img {
    height: 120px;
  }

  .onboarding-container {
    margin: 20px 10px;
  }
}
</style>