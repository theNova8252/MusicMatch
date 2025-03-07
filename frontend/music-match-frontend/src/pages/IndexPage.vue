<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md">
      <h1>Welcome to Music Match 🎵</h1>
      <p v-if="message">{{ message }}</p>
      <q-btn color="primary" label="Test API" @click="testApi" />
      <q-btn color="secondary" label="Login with Spotify" @click="loginWithSpotify" class="q-mt-md" />
      <q-btn color="secondary" label="Login with Google" @click="loginWithGoogle" class="q-mt-md" />
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const message = ref('');

async function testApi() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/`);
    message.value = res.data;
  } catch {
    message.value = 'API not reachable.';
  }
}

async function loginWithSpotify() {
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/spotify`;
}

async function loginWithGoogle() {
  window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
}
</script>