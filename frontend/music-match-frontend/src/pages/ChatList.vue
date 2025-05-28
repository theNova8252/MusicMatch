<!-- ChatList.vue -->
<template>
  <div class="chat-list-page">
    <div class="header">
      <h1>Your Chats</h1>
      <button @click="goBack" class="back-btn">Back to Matches</button>
    </div>

    <div v-if="loading" class="loading">
      <p>Loading your conversations...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <button @click="loadConversations">Retry</button>
    </div>

    <div v-else-if="conversations.length === 0" class="no-conversations">
      <p>No conversations yet</p>
      <p>Start chatting with your matches to see them here!</p>
    </div>

    <div v-else class="conversations-list">
      <div v-for="conversation in conversations" :key="conversation.otherUser.id" class="conversation-item"
        @click="openChat(conversation.otherUser.id)">
        <div class="user-avatar">
          <img v-if="conversation.otherUser.profileImage" :src="conversation.otherUser.profileImage"
            :alt="conversation.otherUser.name" class="avatar-img" />
          <div v-else class="avatar-placeholder">
            {{ getInitials(conversation.otherUser.name) }}
          </div>
        </div>

        <div class="conversation-content">
          <div class="conversation-header">
            <h3 class="user-name">{{ conversation.otherUser.name }}</h3>
            <span class="last-message-time">
              {{ formatTime(conversation.lastMessage.createdAt) }}
            </span>
          </div>

          <div class="last-message">
            <span class="message-sender">
              {{ conversation.lastMessage.senderId === currentUserId ? 'You: ' : '' }}
            </span>
            <span class="message-content">
              {{ truncateMessage(conversation.lastMessage.content) }}
            </span>
          </div>

          <div v-if="conversation.unreadCount > 0" class="unread-badge">
            {{ conversation.unreadCount }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatList',
  data() {
    return {
      conversations: [],
      loading: true,
      error: null,
      currentUserId: null,
    };
  },
  async created() {
    await this.loadCurrentUser();
    await this.loadConversations();
  },
  methods: {
    async loadCurrentUser() {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', { withCredentials: true });

        if (response.data.user) {
          this.currentUserId = response.data.user.id;
        } else if (response.data.id) {
          this.currentUserId = response.data.id;
        }

        console.log('Current user ID:', this.currentUserId);
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    },

    async loadConversations() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Loading conversations...');
        const response = await axios.get('http://localhost:5000/api/users/conversations', {
          withCredentials: true
        });

        console.log('Conversations response:', response.data);

        if (response.data.conversations && Array.isArray(response.data.conversations)) {
          this.conversations = response.data.conversations;
        } else {
          this.conversations = [];
        }

        console.log('Loaded conversations:', this.conversations.length);

      } catch (error) {
        console.error('Error loading conversations:', error);

        if (error.response) {
          if (error.response.status === 401) {
            this.error = 'Please log in to view your conversations';
          } else if (error.response.status === 404) {
            this.error = 'Conversations not found';
          } else {
            this.error = `Server error: ${error.response.status}`;
          }
        } else if (error.request) {
          this.error = 'Network error. Please check your connection.';
        } else {
          this.error = 'An unexpected error occurred';
        }

        this.conversations = [];
      } finally {
        this.loading = false;
      }
    },

    openChat(userId) {
      console.log('Opening chat with user:', userId);
      // Navigate to the individual chat page
      this.$router.push(`/chat/${userId}`);
    },

    goBack() {
      // Go back to the match swipe page
      this.$router.push('/swipe'); // or wherever your match swipe is
    },

    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    truncateMessage(message) {
      if (!message) return '';
      return message.length > 50 ? message.substring(0, 50) + '...' : message;
    },

    formatTime(timestamp) {
      if (!timestamp) return '';

      const messageDate = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - messageDate) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) { // Less than a week
        return messageDate.toLocaleDateString([], { weekday: 'short' });
      } else {
        return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }
  }
};
</script>

<style scoped>
.chat-list-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.back-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {
  background: #0056b3;
}

.loading,
.error,
.no-conversations {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #dc2626;
}

.error button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: white;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.conversation-item:hover {
  background: #f8f9fa;
}

.user-avatar {
  margin-right: 15px;
  flex-shrink: 0;
}

.avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.user-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.last-message-time {
  font-size: 12px;
  color: #666;
}

.last-message {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
}

.message-sender {
  font-weight: 500;
  color: #333;
}

.message-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  position: absolute;
  top: 10px;
  right: 15px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

@media (max-width: 768px) {
  .chat-list-page {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .conversation-item {
    padding: 12px;
  }

  .avatar-img,
  .avatar-placeholder {
    width: 40px;
    height: 40px;
  }
}
</style>