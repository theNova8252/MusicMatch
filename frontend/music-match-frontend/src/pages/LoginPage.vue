<template>
  <q-page class="flex flex-center">
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo">
          <img src="../assets/musicmatch.png" alt="MusicMatch Logo" />
        </div>

        <h2 class="text-center q-mb-lg">Welcome to MusicMatch</h2>
        <p class="text-center q-mb-lg text-grey-8">Connect with your favorite platforms</p>

        <div class="q-gutter-md">
          <q-btn color="primary" class="full-width q-py-sm" icon="fab fa-spotify" label="Continue with Spotify"
            @click="spotifyLogin" />

          <q-btn color="secondary" class="full-width q-py-sm" icon="fab fa-google" label="Continue with Google"
            @click="googleLogin" />
        </div>

        <p class="text-center q-mt-lg text-grey-6 text-caption">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const spotifyLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/spotify';
};

const googleLogin = () => {
  window.location.href = 'http://localhost:5000/api/auth/google';
};

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true });
    if (res.data.user) {
      if (res.data.user.isNewUser) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    }
  } catch {
    console.log('Not authenticated, staying on login page');
  }
});
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.login-card {
  background-color: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-logo {
  text-align: center;
  justify-content: center;
  margin-bottom: 20px;
}

.login-logo img {
  max-width: 100%;
  height: auto;
}
</style>