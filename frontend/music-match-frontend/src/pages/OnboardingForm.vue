<template>
  <q-page class="flex flex-center">
    <div v-if="step === 1" class="onboarding-container">
      <h2>Step 1: User Details</h2>
      <q-input v-model="username" label="Preferred Username" dense outlined />
      <q-input v-model="dateOfBirth" type="date" label="Date of Birth" dense outlined />
      <q-btn color="primary" label="Next" @click="saveUserDetails" />
    </div>

    <div v-else-if="step === 2" class="onboarding-container">
      <h2>Step 2: Select Favorite Artists</h2>
      <div v-if="spotifyArtists.length" class="artist-grid">
        <q-card v-for="artist in spotifyArtists" :key="artist.name" class="artist-card"
          :class="{ selected: selectedArtists.includes(artist.name) }" @click="selectArtist(artist)">
          <q-img :src="artist.image" class="artist-img" />
          <p>{{ artist.name }}</p>
        </q-card>
      </div>
      <q-input v-model="customArtist" label="Or enter your own" dense outlined />
      <q-btn color="primary" label="Fetch Artists" @click="fetchArtists" />
      <q-btn color="secondary" label="Finish Setup" @click="finishOnboarding" />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const dateOfBirth = ref('');
const step = ref(1);
const spotifyArtists = ref([]);
const selectedArtists = ref([]);
const customArtist = ref('');
const router = useRouter();

async function saveUserDetails() {
  try {
    await axios.post('http://localhost:5000/api/auth/save-user-details', {
      username: username.value,
      dateOfBirth: dateOfBirth.value
    }, { withCredentials: true });

    step.value = 2;
  } catch (error) {
    console.error('Failed to save user details:', error.response?.data || error.message);
  }
}

async function fetchArtists() {
  try {
    const response = await axios.get(`http://localhost:5000/api/auth/fetch-spotify-artists?search=${customArtist.value}`, { withCredentials: true });
    spotifyArtists.value = response.data.map(artist => ({
      name: artist.name,
      image: artist.images.length > 0 ? artist.images[0].url : 'https://via.placeholder.com/150'
    }));
  } catch (error) {
    console.error('Failed to fetch artists:', error.response?.data || error.message);
  }
}

function selectArtist(artist) {
  if (!selectedArtists.value.includes(artist.name)) {
    selectedArtists.value.push(artist.name);
  } else {
    selectedArtists.value = selectedArtists.value.filter(a => a !== artist.name);
  }
}

async function finishOnboarding() {
  try {
    await axios.post('http://localhost:5000/api/auth/save-onboarding-data', {
      favoriteArtists: selectedArtists.value
    }, { withCredentials: true });

    router.push('/dashboard');
  } catch (error) {
    console.error('Failed to complete onboarding:', error.response?.data || error.message);
  }
}
</script>

<style scoped>
.onboarding-container {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
}

.artist-card {
  text-align: center;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}

.artist-card.selected {
  border: 2px solid green;
}

.artist-img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>