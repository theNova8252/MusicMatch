<template>
  <q-page class="flex flex-center column">
    <div class="onboarding-container">
      <h1 class="text-h4 q-mb-lg">Welcome to MusicMatch!</h1>

      <q-form @submit="saveOnboardingData" class="q-gutter-md">
        <q-input v-model="username" label="Username" outlined :rules="[val => !!val || 'Username is required']" />

        <q-input v-model="dateOfBirth" label="Date of Birth" outlined type="date"
          :rules="[val => !!val || 'Date of birth is required']" />

        <div class="q-mb-md">
          <div class="text-subtitle1 q-mb-sm">Favorite Artists</div>
          <div class="row items-center q-gutter-sm">
            <q-input v-model="artistInput" label="Add an artist" outlined dense class="col" />
            <q-btn color="primary" icon="add" round flat @click="addArtist" />
          </div>

          <div class="artists-container q-mt-md">
            <q-chip v-for="(artist, index) in favoriteArtists" :key="index" removable color="primary" text-color="white"
              @remove="removeArtist(index)">
              {{ artist }}
            </q-chip>
            <div v-if="favoriteArtists.length === 0" class="text-grey-6">
              Add some of your favorite artists to get started
            </div>
          </div>
        </div>

        <div class="q-mt-lg">
          <q-btn type="submit" color="primary" label="Complete Setup" class="full-width" :loading="loading" />
        </div>
      </q-form>
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

const username = ref('');
const dateOfBirth = ref('');
const favoriteArtists = ref([]);
const artistInput = ref('');
const loading = ref(false);

// Add artist to the list
const addArtist = () => {
  if (artistInput.value.trim()) {
    favoriteArtists.value.push(artistInput.value.trim());
    artistInput.value = '';
  }
};

// Remove artist from the list
const removeArtist = (index) => {
  favoriteArtists.value.splice(index, 1);
};

// Save onboarding data
const saveOnboardingData = async () => {
  loading.value = true;
  try {
    await axios.post(
      'http://localhost:5000/api/auth/save-onboarding-data',
      {
        username: username.value,
        dateOfBirth: dateOfBirth.value,
        favoriteArtists: favoriteArtists.value
      },
      { withCredentials: true }
    );

    $q.notify({ color: 'positive', message: 'Profile setup complete!' });

    // Ensure isNewUser is false after onboarding
    const res = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });
    if (res.data.user) {
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('Onboarding Error:', error.response?.data || error.message);
    $q.notify({ color: 'negative', message: 'Failed to save profile data' });
  } finally {
    loading.value = false;
  }
};

// Check if user is already authenticated
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });

    // Pre-fill form with existing data if available
    if (response.data.user) {
      const user = response.data.user;

      username.value = user.username || '';
      dateOfBirth.value = user.dateOfBirth || '';

      // If user is not new, redirect to dashboard
      if (!user.isNewUser) {
        router.push('/dashboard');
      }
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    // If not authenticated, redirect to login
    if (error.response?.status === 401) {
      router.push('/login');
    }
  }
});
</script>

<style scoped>
.onboarding-container {
  max-width: 600px;
  width: 90%;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.artists-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 50px;
  padding: 10px;
  border-radius: 8px;
  background: #f5f5f5;
}
</style>