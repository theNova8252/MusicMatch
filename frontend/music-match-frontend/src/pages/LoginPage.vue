<template>
  <q-page class="flex flex-center login-background">
    <div class="login-container">
      <div class="login-card">
        <div class="login-logo pulse-animation">
          <img src="../assets/musicmatch.png" alt="MusicMatch Logo" />
        </div>

        <h2 class="text-primary text-weight-bold text-center q-mb-md">Welcome to MusicMatch</h2>
        <p class="text-center q-mb-xl text-grey-7">Connect and discover your perfect sound</p>

        <div class="q-gutter-y-md login-buttons">
          <!-- <q-btn unelevated rounded color="green-10" class="full-width login-btn q-py-sm" icon-right="fab fa-spotify" label="Continue with Spotify"
            @click="spotifyLogin">
            <q-icon name="fab fa-spotify" size="24px" class="q-mr-sm" />
          </q-btn> -->

          <q-btn unelevated rounded color="blue-7" class="full-width login-btn q-py-sm" @click="googleLogin">
            <q-icon name="fab fa-google" size="24px" class="q-mr-sm" />
            <div class="login-btn-text">Continue with Google</div>
          </q-btn>
        </div>

        <p class="text-center text-grey-6 text-caption terms-text">
          By continuing, you agree to our <a href="#" class="text-primary">Terms of Service</a> and <a href="#"
            class="text-primary">Privacy Policy</a>
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';

const router = useRouter();
const $q = useQuasar();
const loading = ref(false);

// const spotifyLogin = () => {
//   loading.value = true;
//   window.location.href = 'http://localhost:5000/api/auth/spotify';
// };

const googleLogin = () => {
  loading.value = true;
  $q.loading.show({
    message: 'Connecting to Google...'
  });
  setTimeout(() => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }, 800);
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
.login-background {
  background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
  min-height: 100vh;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.login-card {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-logo {
  text-align: center;
  margin-bottom: 30px;
}

.login-logo img {
  max-width: 180px;
  height: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
}

.login-btn {
  height: 54px;
  font-size: 16px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.login-btn-text {
  padding-left: 8px;
  letter-spacing: 0.5px;
}

.login-divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.login-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.1);
}

.login-divider span {
  position: relative;
  background-color: white;
  padding: 0 12px;
  font-size: 14px;
}

.terms-text {
  line-height: 1.5em;
  margin-top: 30px;
}

.terms-text a {
  text-decoration: none;
  font-weight: 500;
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-logo img {
    max-width: 150px;
  }
}
</style>