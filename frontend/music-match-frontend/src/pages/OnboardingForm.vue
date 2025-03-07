<template>
  <q-page class="onboarding-container">
    <h1>Welcome, {{ email }}</h1>
    <p>Tell us about your music taste!</p>

    <q-card class="onboarding-card">
      <q-card-section>
        <h3>Select your favorite artists</h3>
        <q-chip v-for="artist in suggestedArtists" :key="artist" :selected="selectedArtists.includes(artist)" clickable
          @click="toggleArtist(artist)">
          {{ artist }}
        </q-chip>

        <q-input v-model="customArtist" label="Or enter your own" @keydown.enter="addCustomArtist" />
      </q-card-section>

      <q-card-section>
        <h3>Select your favorite tracks</h3>
        <q-input v-model="customTrack" label="Enter your favorite song" @keydown.enter="addCustomTrack" />
      </q-card-section>

      <q-btn label="Finish Setup" color="primary" @click="submitOnboarding" />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const email = ref(route.query.email || '');
const suggestedArtists = ['The Weeknd', 'Billie Eilish', 'Drake', 'Adele'];
const selectedArtists = ref([]);
const customArtist = ref('');
const customTrack = ref('');
const selectedTracks = ref([]);

function toggleArtist(artist) {
  if (selectedArtists.value.includes(artist)) {
    selectedArtists.value = selectedArtists.value.filter(a => a !== artist);
  } else {
    selectedArtists.value.push(artist);
  }
}

function addCustomArtist() {
  if (customArtist.value) {
    selectedArtists.value.push(customArtist.value);
    customArtist.value = '';
  }
}

function addCustomTrack() {
  if (customTrack.value) {
    selectedTracks.value.push(customTrack.value);
    customTrack.value = '';
  }
}

async function submitOnboarding() {
  try {
    await axios.post('http://localhost:5000/api/auth/onboarding', {
      email: email.value,
      favoriteArtists: selectedArtists.value,
      favoriteTracks: selectedTracks.value,
    });

    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to save onboarding data:', error.response?.data || error.message);
  }
}
</script>

<style scoped>
.onboarding-container {
  text-align: center;
  padding: 30px;
}

.onboarding-card {
  padding: 20px;
  max-width: 600px;
  margin: 20px auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
}
</style>