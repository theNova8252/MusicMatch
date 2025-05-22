<template>
  <ChatView v-if="currentUser && matchedUser" :currentUser="currentUser" :matchedUser="matchedUser" />
  <div v-else>Loading chat...</div>
</template>

<script>
import ChatView from '../components/ChatView.vue';
import axios from 'axios';

export default {
  components: { ChatView },
  data() {
    return {
      currentUser: null,
      matchedUser: null,
    };
  },
  async created() {
    try {
      const meRes = await axios.get('/api/users/me', { withCredentials: true });
      if (!meRes.data.user || typeof meRes.data.user !== 'object') {
        throw new Error(meRes.data.message || 'Invalid currentUser response');
      }
      this.currentUser = meRes.data.user;

      const partnerId = this.$route.params.partnerId;
      const matchRes = await axios.get(`/api/users/${partnerId}`, { withCredentials: true });
      if (!matchRes.data || typeof matchRes.data !== 'object') {
        throw new Error(matchRes.data.message || 'Invalid matchedUser response');
      }
      this.matchedUser = matchRes.data;
    } catch (err) {
      console.error('Failed to load user(s):', err);
      this.currentUser = null;
      this.matchedUser = null;
    }
  },
};
</script>