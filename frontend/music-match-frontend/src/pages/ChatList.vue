<template>
  <!-- Main Content -->
  <div class="chat-list-page">
    <div class="header">
      <button class="back-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span>Back to Matches</span>
      </button>
      <h1>Your Chats</h1>
    </div>

    <div class="chat-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading your conversations...</p>
      </div>

      <div v-else-if="error" class="error">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="loadConversations" class="retry-button">Try Again</button>
      </div>

      <div v-else-if="conversations.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <h2>No conversations yet</h2>
        <p>Start chatting with your matches to see them here!</p>
        <button @click="goBack" class="start-swiping-button">Back to Swiping</button>
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

          <div class="chat-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
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
      this.$router.push(`/chat/${userId}`);
    },

    goBack() {
      this.$router.push('/swipe');
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

/* Main Content Styles */
.chat-list-page {
  min-height: 100vh;
  background: transparent;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  z-index: 2;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #6d28d9;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #6d28d9;
  color: white;
  transform: translateY(-2px);
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.8);
}

.chat-content {
  max-width: 600px;
  margin: 0 auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6d28d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #333;
}

.empty-state p {
  color: #666;
  margin-bottom: 24px;
}

.start-swiping-button {
  background: #6d28d9;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-swiping-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(109, 40, 217, 0.3);
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 2;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(109, 40, 217, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.conversation-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: rgba(109, 40, 217, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6d28d9, #a78bfa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.last-message-time {
  font-size: 12px;
  color: #666;
  flex-shrink: 0;
  margin-left: 8px;
}

.last-message {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
}

.message-sender {
  color: #6d28d9;
  font-weight: 500;
}

.message-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.unread-badge {
  background: #6d28d9;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.chat-arrow {
  color: #ccc;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .chat-list-page {
    padding: 16px;
  }

  .header h1 {
    font-size: 24px;
  }

  .conversation-item {
    padding: 12px;
    gap: 12px;
  }

  .user-avatar {
    width: 48px;
    height: 48px;
  }

  .user-name {
    font-size: 16px;
  }

  .message-content {
    font-size: 13px;
  }
}
body.dark-mode .chat-list-page {
  background: transparent;
}

body.dark-mode .conversation-item {
  background: rgba(35, 33, 54, 0.9) !important;
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #f0f9ff;
}

body.dark-mode .header h1 {
  color: #f0f9ff !important;
  text-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
}

body.dark-mode .back-button {
  background: rgba(35, 33, 54, 0.9) !important;
  color: #c4b5fd !important;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

body.dark-mode .user-name {
  color: #fef3c7 !important;
}

body.dark-mode .last-message-time,
body.dark-mode .message-content {
  color: #cbd5e1 !important;
}
body.dark-mode .message-sender {
  color: #c4b5fd !important;
}
</style>