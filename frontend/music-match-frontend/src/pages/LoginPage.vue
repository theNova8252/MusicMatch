<!-- frontend/src/pages/LoginPage.vue -->
<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md">
      <h2>Login to Music Match</h2>
      <q-btn color="primary" label="Login with Spotify" @click="loginWithSpotify" />
      <q-btn color="red" label="Login with Google" @click="loginWithGoogle" />
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';
import axios from 'axios';
import { onMounted } from 'vue';

const router = useRouter();

async function checkUser() {
  if (localStorage.getItem("logoutInProgress")) {
    console.warn("Skipping session check due to recent logout.");
    return;
  }

  try {
    const response = await axios.get("http://localhost:5000/api/auth/profile", { withCredentials: true });

    if (response.data?.user) {
      if (response.data.user.isNewUser) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  } catch {
    console.warn("No active session found. Staying on login page.");
  }
}
onMounted(() => {
  checkUser();
});
function loginWithSpotify() {
  window.location.href = 'http://localhost:5000/api/auth/spotify';
}
function loginWithGoogle() {
  window.location.href = 'http://localhost:5000/api/auth/google';
}
</script>