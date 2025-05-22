<template>
  <div class="messages-page">
    <div class="sidebar">
      <h2>Your Matches</h2>
      <ul>
        <li v-for="user in matches" :key="user.id" :class="{ active: selectedMatch && user.id === selectedMatch.id }"
          @click="selectMatch(user)">
          <img :src="user.profileImage || 'https://via.placeholder.com/40'" class="avatar" />
          <span>{{ user.name }}</span>
        </li>
      </ul>
    </div>
    <div class="chat-area">
      <ChatView v-if="currentUser && selectedMatch" :currentUser="currentUser" :matchedUser="selectedMatch" />
      <div v-else class="empty-chat">
        <p v-if="!currentUser">Loading...</p>
        <p v-else>Select a match to start chatting.</p>
      </div>
    </div>
  </div>
</template>

<script>
import ChatView from '../components/ChatView.vue';
import axios from 'axios';

export default {
  components: { ChatView },
  data() {
    return {
      currentUser: null,
      matches: [],
      selectedMatch: null,
    };
  },
  async created() {
    // Fetch current user
    const meRes = await axios.get('/api/users/me', { withCredentials: true });
    this.currentUser = meRes.data;

    // Fetch matches (users you matched with)
    const matchesRes = await axios.get('/api/users/matches', { withCredentials: true });
    this.matches = matchesRes.data;
  },
  methods: {
    selectMatch(user) {
      this.selectedMatch = user;
    },
  },
};
</script>

<style scoped>
.messages-page {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 260px;
  background: #f3f3f3;
  border-right: 1px solid #ddd;
  padding: 20px 0;
  overflow-y: auto;
}

.sidebar h2 {
  margin: 0 0 16px 24px;
  font-size: 1.2em;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  display: flex;
  align-items: center;
  padding: 10px 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.sidebar li.active,
.sidebar li:hover {
  background: #e0e7ff;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.chat-area {
  flex: 1;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: #fff;
}

.empty-chat {
  margin: auto;
  color: #888;
  font-size: 1.1em;
}
</style>