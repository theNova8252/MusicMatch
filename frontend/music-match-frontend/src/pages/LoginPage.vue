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
function loginWithSpotify() {
  window.location.href = 'http://localhost:5000/api/auth/spotify';
}
function loginWithGoogle() {
  window.location.href = 'http://localhost:5000/api/auth/google';
}
</script>