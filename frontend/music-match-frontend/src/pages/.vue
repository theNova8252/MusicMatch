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
        <div class="user-details">
          <h2>{{ otherUser.name }}</h2>
          <div v-if="isUserTyping" class="typing-indicator">
            <span class="typing-text">typing...</span>
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
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
          :class="['message', message.senderId == currentUserId ? 'sent' : 'received']">
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.createdAt || message.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-input-container">
      <div class="message-input">
        <input v-model="newMessage" @keypress.enter="sendMessage" @input="handleTyping" @blur="stopTyping"
          placeholder="Type a message..." :disabled="sending" ref="messageInput" />
        <button @click="sendMessage" :disabled="!newMessage.trim() || sending" class="send-btn">
          {{ sending ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { useWebSocket } from '../composables/useWebSocket.js';

export default {
  name: 'ChatPage',
  data() {
    return {
      otherUser: null,
      messages: [],
      currentUserId: null,
      newMessage: '',
      loading: true,
      error: null,
      sending: false,
      partnerId: null,
      isUserTyping: false,
      typingTimeout: null,
      isCurrentlyTyping: false,
      socketInitialized: false,
    };
  },
  setup() {
    const webSocket = useWebSocket();
    return {
      webSocket
    };
  },
  async created() {
    this.partnerId = this.$route.params.partnerId;
    console.log('ChatPage created with partnerId:', this.partnerId);
    await this.loadCurrentUser();
    await this.loadOtherUser();
    await this.loadMessages();
    this.initializeWebSocket();
  },
  beforeUnmount() {
    this.webSocket.removeHandlers();
    this.webSocket.disconnect();
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  },
  methods: {
    async loadCurrentUser() {
      try {
        const res = await axios.get('http://localhost:5000/api/users/me', { withCredentials: true });
        this.currentUserId = res.data?.user?.id || res.data?.id || null;
        console.log('Current user loaded:', this.currentUserId);
      } catch (err) {
        console.error('Error loading current user:', err);
        this.error = 'Error loading current user';
      }
    },

    async loadOtherUser() {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${this.partnerId}`, {
          withCredentials: true
        });
        this.otherUser = res.data?.user || res.data || null;
        console.log('Other user loaded:', this.otherUser);
      } catch (err) {
        console.error('Error loading other user:', err);
        this.error = 'Error loading user information';
      }
    },

    async loadMessages() {
      this.loading = true;
      this.error = null;
      console.log('Loading messages for partner:', this.partnerId);

      try {
        let res;
        try {
          res = await axios.get(`http://localhost:5000/api/chat/${this.partnerId}`, {
            withCredentials: true
          });
        } catch {
          console.log('Chat endpoint failed, trying messages endpoint...');
          res = await axios.get(`http://localhost:5000/api/messages/${this.partnerId}`, {
            withCredentials: true
          });
        }

        console.log('Messages API response:', res.data);

        let messages = [];
        if (Array.isArray(res.data)) {
          messages = res.data;
        } else if (res.data.messages && Array.isArray(res.data.messages)) {
          messages = res.data.messages;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          messages = res.data.data;
        } else {
          console.warn('Unexpected messages response format:', res.data);
          messages = [];
        }

        this.messages = messages;
        console.log('Messages loaded:', this.messages.length);

        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (err) {
        console.error('Error loading messages:', err);
        this.error = `Error loading messages: ${err.response?.status || 'Network error'}`;
        this.messages = [];
      } finally {
        this.loading = false;
      }
    },

    initializeWebSocket() {
      if (!this.currentUserId || this.socketInitialized) {
        return;
      }

      console.log('=== INITIALIZING WEBSOCKET ===');
      this.socketInitialized = true;

      this.webSocket.connect(this.currentUserId);

      // Handle incoming messages
      this.webSocket.onMessage((message) => {
        console.log('=== WEBSOCKET MESSAGE RECEIVED ===', message);

        // Check if message is for this chat
        const isForThisChat = (
          (message.senderId == this.partnerId && message.receiverId == this.currentUserId) ||
          (message.senderId == this.currentUserId && message.receiverId == this.partnerId)
        );

        if (isForThisChat) {
          // Check if message already exists to avoid duplicates
          const exists = this.messages.find(m =>
            m.id === message.id ||
            (m.content === message.content &&
              m.senderId == message.senderId &&
              Math.abs(new Date(m.createdAt || m.timestamp) - new Date(message.timestamp)) < 1000)
          );

          if (!exists) {
            // Convert string IDs to numbers to match your data format
            const newMessage = {
              id: message.id,
              senderId: parseInt(message.senderId),
              receiverId: parseInt(message.receiverId),
              content: message.content,
              createdAt: message.timestamp,
              timestamp: message.timestamp
            };

            this.messages.push(newMessage);

            this.$nextTick(() => {
              this.scrollToBottom();
            });
          }
        }
      });

      // Handle typing indicators
      this.webSocket.onTyping((data) => {
        console.log('=== TYPING EVENT ===', data);

        if (data.senderId == this.partnerId) {
          this.isUserTyping = data.isTyping;

          if (data.isTyping) {
            if (this.typingTimeout) clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
              this.isUserTyping = false;
            }, 3000);
          }
        }
      });
    },

    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return;

      this.sending = true;
      const content = this.newMessage.trim();
      this.newMessage = '';

      this.stopTyping();

      console.log('=== SENDING MESSAGE ===');
      console.log('Content:', content);
      console.log('Partner ID:', this.partnerId);
      console.log('Current User ID:', this.currentUserId);

      try {
        // Send via WebSocket first for immediate feedback
        this.webSocket.sendMessage(this.partnerId, content);

        // Then send via HTTP API for persistence
        const res = await axios.post('http://localhost:5000/api/messages/send', {
          receiverId: this.partnerId,  // Add this line!
          content
        }, {
          withCredentials: true
        });

        console.log('Message saved to database:', res.data);
        this.$refs.messageInput?.focus();

      } catch (err) {
        console.error('Error sending message:', err);
        this.error = 'Error sending message';
        this.newMessage = content; // Restore message if failed
      } finally {
        this.sending = false;
      }
    },

    handleTyping() {
      if (!this.isCurrentlyTyping) {
        this.isCurrentlyTyping = true;
        this.webSocket.sendTyping(this.partnerId, true);
      }

      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }

      this.typingTimeout = setTimeout(() => {
        this.stopTyping();
      }, 1000);
    },

    stopTyping() {
      if (this.isCurrentlyTyping) {
        this.isCurrentlyTyping = false;
        this.webSocket.sendTyping(this.partnerId, false);
      }
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
        this.typingTimeout = null;
      }
    },

    scrollToBottom() {
      const el = this.$refs.messagesContainer;
      if (el) {
        setTimeout(() => {
          el.scrollTop = el.scrollHeight;
        }, 50);
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
      const d = new Date(timestamp), now = new Date();
      const diff = (now - d) / (1000 * 60 * 60);
      if (diff < 1) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diff < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diff < 168) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

.user-details h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.typing-text {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

.typing-dots {
  display: flex;
  gap: 2px;
}

.typing-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #666;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
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