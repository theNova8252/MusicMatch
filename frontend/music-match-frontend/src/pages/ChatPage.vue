<!-- ChatPage.vue -->
<template>
  <div class="chat-page">
    <!-- Header -->
    <div class="chat-header">
      <button @click="goBack" class="back-btn">
        ← Back
      </button>
      <div v-if="otherUser" class="user-info">
        <div class="user-avatar">
          <img v-if="otherUser.profileImage" :src="otherUser.profileImage" :alt="otherUser.name" class="avatar-img" />
          <div v-else class="avatar-placeholder">
            {{ getInitials(otherUser.name) }}
          </div>
        </div>
        <h2>{{ otherUser.name }}</h2>
      </div>
      <div v-else class="loading-header">Loading...</div>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading" class="loading">
        <p>Loading messages...</p>
      </div>

      <div v-else-if="error" class="error">
        <p>Error: {{ error }}</p>
        <button @click="loadMessages">Retry</button>
      </div>

      <div v-else-if="messages.length === 0" class="no-messages">
        <p>No messages yet</p>
        <p>Start the conversation!</p>
      </div>

      <div v-else class="messages-list">
        <div v-for="message in messages" :key="message.id"
          :class="['message', message.senderId === currentUserId ? 'sent' : 'received']">
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <div class="message-input">
        <input v-model="newMessage" @keypress.enter="sendMessage" placeholder="Type a message..." :disabled="sending" />
        <button @click="sendMessage" :disabled="!newMessage.trim() || sending" class="send-btn">
          {{ sending ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ChatPage',
  data() {
    return {
      otherUserId: null,
      otherUser: null,
      messages: [],
      currentUserId: null,
      newMessage: '',
      loading: true,
      error: null,
      sending: false,
    };
  },
  async created() {
    this.otherUserId = this.$route.params.userId;
    await this.loadCurrentUser();
    await this.loadOtherUser();
    await this.loadMessages();
  },
  methods: {
    async loadCurrentUser() {
      try {
        const response = await axios.get('http://localhost:5000/api/users/me', {
          withCredentials: true
        });

        if (response.data.user) {
          this.currentUserId = response.data.user.id;
        } else if (response.data.id) {
          this.currentUserId = response.data.id;
        }

        console.log('Current user ID:', this.currentUserId);
      } catch (error) {
        console.error('Error loading current user:', error);
        this.error = 'Failed to load user information';
      }
    },

    async loadOtherUser() {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${this.otherUserId}`, {
          withCredentials: true
        });

        if (response.data.user) {
          this.otherUser = response.data.user;
        }

        console.log('Other user:', this.otherUser);
      } catch (error) {
        console.error('Error loading other user:', error);
        this.error = 'Failed to load user information';
      }
    },

    async loadMessages() {
      this.loading = true;
      this.error = null;

      try {
        console.log('Loading messages between', this.currentUserId, 'and', this.otherUserId);

        // You'll need to create this endpoint on your backend
        const response = await axios.get(`http://localhost:5000/api/messages/${this.otherUserId}`, {
          withCredentials: true
        });

        console.log('Messages response:', response.data);

        if (response.data.messages && Array.isArray(response.data.messages)) {
          this.messages = response.data.messages;
          // Scroll to bottom after messages load
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          this.messages = [];
        }

      } catch (error) {
        console.error('Error loading messages:', error);

        if (error.response) {
          if (error.response.status === 401) {
            this.error = 'Please log in to view messages';
          } else if (error.response.status === 404) {
            this.error = 'Conversation not found';
          } else {
            this.error = `Server error: ${error.response.status}`;
          }
        } else if (error.request) {
          this.error = 'Network error. Please check your connection.';
        } else {
          this.error = 'An unexpected error occurred';
        }

        this.messages = [];
      } finally {
        this.loading = false;
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return;

      this.sending = true;
      const messageContent = this.newMessage.trim();
      this.newMessage = '';

      try {
        const response = await axios.post('http://localhost:5000/api/messages', {
          receiverId: this.otherUserId,
          content: messageContent
        }, {
          withCredentials: true
        });

        console.log('Message sent:', response.data);

        // Add the new message to the list
        if (response.data.message) {
          this.messages.push(response.data.message);
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }

      } catch (error) {
        console.error('Error sending message:', error);
        // Restore the message in the input if sending failed
        this.newMessage = messageContent;

        if (error.response && error.response.status === 401) {
          this.error = 'Please log in to send messages';
        } else {
          this.error = 'Failed to send message. Please try again.';
        }
      } finally {
        this.sending = false;
      }
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    goBack() {
      this.$router.push('/chats');
    },

    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },

    formatTime(timestamp) {
      if (!timestamp) return '';

      const messageDate = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - messageDate) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 24) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 168) { // Less than a week
        return messageDate.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      } else {
        return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    }
  }
};
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: #f8f9fa;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 15px;
  font-size: 14px;
}

.back-btn:hover {
  background: #0056b3;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.user-info h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.loading-header {
  color: #666;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.loading,
.error,
.no-messages {
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

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
  align-items: flex-end;
}

.message.received {
  align-self: flex-start;
  align-items: flex-start;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  max-width: 100%;
}

.message.sent .message-content {
  background: #007bff;
  color: white;
}

.message.received .message-content {
  background: white;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-time {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  padding: 0 8px;
}

.message-input-container {
  padding: 15px 20px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.message-input {
  display: flex;
  gap: 10px;
  align-items: center;
}

.message-input input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 25px;
  outline: none;
  font-size: 14px;
}

.message-input input:focus {
  border-color: #007bff;
}

.send-btn {
  padding: 12px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.send-btn:hover:not(:disabled) {
  background: #0056b3;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .chat-page {
    height: 100vh;
  }

  .chat-header {
    padding: 10px 15px;
  }

  .messages-container {
    padding: 15px;
  }

  .message {
    max-width: 85%;
  }

  .message-input-container {
    padding: 10px 15px;
  }
}
</style>