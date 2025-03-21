<template>
  <q-page class="flex flex-center column">
    <div class="onboarding-container">
      <h1 class="text-h4 q-mb-lg">Welcome to MusicMatch!</h1>

      <q-form @submit="saveOnboardingData" class="q-gutter-md">
        <q-input v-model="username" label="Username" outlined :rules="[val => !!val || 'Username is required']" />
        <q-input v-model="dateOfBirth" label="Date of Birth" outlined type="date" :rules="[validateAge]" />
        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Profile Picture</div>
          <q-file v-model="profileImage" label="Upload Profile Picture" accept="image/*" filled />
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Select Favorite Artists</div>
          <div class="row q-gutter-sm">
            <q-card v-for="artist in exampleArtists" :key="artist.name" class="example-artist"
              @click="addArtist(artist.name)">
              <q-img :src="artist.image" class="artist-img" />
              <p class="artist-name">{{ artist.name }}</p>
            </q-card>
          </div>
        </div>

        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Your Favorite Artists</div>
          <div class="row items-center q-gutter-sm">
            <q-input v-model="artistInput" label="Add an artist" outlined dense class="col" />
            <q-btn color="primary" icon="add" round flat @click="addArtist(artistInput)" />
          </div>

          <div class="artists-container q-mt-md">
            <q-chip v-for="(artist, index) in favoriteArtists" :key="index" removable color="primary" text-color="white"
              @remove="removeArtist(index)">
              {{ artist }}
            </q-chip>
          </div>
        </div>

        <q-btn type="submit" color="primary" label="Complete Setup" class="full-width" :loading="loading" />
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const username = ref('');
const dateOfBirth = ref('');
const profileImage = ref(null);
const email = ref('');
const favoriteArtists = ref([]);
const artistInput = ref('');
const loading = ref(false);

const exampleArtists = [
  { name: 'Billie Eilish', image: '/src/assets/images/billie.jpg' },
  { name: 'Dua Lipa', image: '/src/assets/images/dualipa.jpg' },
  { name: 'Ed Sheeran', image: '/src/assets/images/edsheeran.jpg' },
  { name: 'Tate McRae', image: '/src/assets/images/tate.jpg' },
  { name: 'The Weeknd', image: '/src/assets/images/weeknd.jpg' }
];

const addArtist = (artist) => {
  if (artist && !favoriteArtists.value.includes(artist)) {
    favoriteArtists.value.push(artist);
  }
};

const removeArtist = (index) => {
  favoriteArtists.value.splice(index, 1);
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
  max-width: 600px;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.example-artist {
  cursor: pointer;
  width: 120px;
  text-align: center;
  padding: 10px;
}

.artist-img {
  width: 100%;
  border-radius: 10px;
}

.artist-name {
  font-size: 14px;
  margin-top: 5px;
}
</style>