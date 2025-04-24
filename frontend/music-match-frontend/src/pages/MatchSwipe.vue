<template>
  <div v-touch:swipe.left="() => swipeLeft(index)" v-touch:swipe.right="() => swipeRight(index)">
    <div class="swipe-deck">
      <q-card v-for="(user, index) in visibleUsers" :key="user.id" class="swipe-card advanced-card">
        <q-img :src="getFullImageUrl(user.profileImage)" class="card-img">
          <div class="card-overlay">
            <div class="text-white text-h6">{{ user.name }}</div>
            <div class="text-white text-subtitle2">{{ user.compatibility }}% Music Match 🎧</div>
          </div>
        </q-img>

        <q-card-actions align="center" class="swipe-buttons">
          <q-btn round flat color="negative" icon="close" @click="swipeLeft(index)" />
          <q-btn round flat color="positive" icon="favorite" @click="swipeRight(index)" />
        </q-card-actions>
      </q-card>
    </div>
  </div>

</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const visibleUsers = ref([])

const fetchAllUsers = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/users/all', { withCredentials: true })
    console.log('🎯 API response:', res.data)
    visibleUsers.value = res.data.users
  } catch (err) {
    console.error('Failed to fetch users:', err.message)
  }
}
const swipeLeft = (index) => {
  visibleUsers.value.splice(index, 1)
}

const swipeRight = (index) => {
  // You could also send a match request here
  visibleUsers.value.splice(index, 1)
}

const getFullImageUrl = (path) => {
  if (!path) return '';
  return `http://localhost:5000${path}`;
}

onMounted(() => {
  fetchAllUsers()
  console.log("Loaded users:", visibleUsers.value)
})
</script>
<style>
.swipe-deck {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 16px;
}

.swipe-card {
  width: 320px;
  max-width: 90vw;
  transition: transform 0.3s ease;
}
.advanced-card {
  width: 320px;
  max-width: 90vw;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.card-img {
  height: 400px;
  background-size: cover;
  position: relative;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  padding: 12px;
}
</style>