<!-- ChatView.vue (Updated) -->
<template>
  <div v-if="currentUser && matchedUser" class="chat-view">
    <div class="chat-header">
      <h2>Chat with {{ matchedUser?.name || matchedUser?.username || 'User' }}</h2>
    </div>

    <div class="chat-messages" ref="messagesContainer">
      <div v-if="loadingMessages" class="loading-messages">
        Loading messages...
      </div>

      <div v-else-if="messages.length === 0" class="no-messages">
        No messages yet. Start the conversation!
      </div>

      <div v-else>
        <div v-for="msg in messages" :key="msg.id || msg.timestamp"
          :class="{ 'my-message': msg.senderId === currentUser.id, 'their-message': msg.senderId !== currentUser.id }"
          class="message">
          <span class="sender">
            {{ msg.sender?.name || msg.sender?.username || (msg.senderId === currentUser.id ? 'You' : matchedUser?.name
              || 'User') }}
          </span>
          <div class="bubble">{{ msg.content }}</div>
          <span class="timestamp" v-if="msg.timestamp">
            {{ formatTime(msg.timestamp) }}
          </span>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Type your message..."
        :disabled="!currentUser || !matchedUser || sending" ref="messageInput" />
      <button @click="sendMessage" :disabled="!currentUser || !matchedUser || !message.trim() || sending">
        {{ sending ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>

  <div v-else class="chat-loading">
    <p>Loading chat...</p>
  </div>
</template>

<script>
import socket from '../boot/socket';
import axios from 'axios';

export default {
  name: 'ChatView',
  props: {
    matchedUser: { type: Object, required: true },
    currentUser: { type: Object, required: true }
  },
  data() {
    return {
      message: '',
      messages: [],
      chatInitialized: false,
      loadingMessages: false,
      sending: false,
      socketListenerAdded: false,
    };
  },
  watch: {
    currentUser: {
      handler() {
        console.log('CurrentUser changed:', this.currentUser);
        this.tryInitChat();
      },
      immediate: true,
    },
    matchedUser: {
      handler() {
        console.log('MatchedUser changed:', this.matchedUser);
        this.tryInitChat();
      },
      immediate: true,
    }
  },
  beforeUnmount() {
    // Clean up socket listeners
    if (this.socketListenerAdded) {
      socket.off('receive_message');
    }
  },
  methods: {
    async tryInitChat() {
      console.log('tryInitChat called');
      console.log('currentUser:', this.currentUser);
      console.log('matchedUser:', this.matchedUser);

      if (
        !this.currentUser || !this.currentUser.id ||
        !this.matchedUser || !this.matchedUser.id
      ) {
        console.log('Missing user data, returning');
        return;
      }

      if (this.chatInitialized) {
        console.log('Chat already initialized, returning');
        return;
      }

      this.chatInitialized = true;
      console.log('Initializing chat...');

      try {
        // Connect to socket
        socket.emit('user_connected', this.currentUser.id);
        console.log('Socket user_connected emitted');

        // Load message history
        await this.loadMessages();

        // Set up real-time message listener (only once)
        if (!this.socketListenerAdded) {
          socket.on('receive_message', this.handleIncomingMessage);
          this.socketListenerAdded = true;
          console.log('Socket listener added');
        }

      } catch (error) {
        console.error('Error in tryInitChat:', error);
      }
    },

    async loadMessages() {
      this.loadingMessages = true;
      try {
        console.log(`Fetching messages from: /api/chat/${this.matchedUser.id}`);
        const { data } = await axios.get(`/api/chat/${this.matchedUser.id}`, { withCredentials: true });
        console.log('Messages loaded:', data);

        // Handle different response structures
        if (Array.isArray(data)) {
          this.messages = data;
        } else if (data.messages && Array.isArray(data.messages)) {
          this.messages = data.messages;
        } else {
          console.warn('Unexpected messages response format:', data);
          this.messages = [];
        }

        // Scroll to bottom after loading
        this.$nextTick(() => {
          this.scrollToBottom();
        });

      } catch (error) {
        console.error('Error loading messages:', error);
        this.messages = [];
      } finally {
        this.loadingMessages = false;
      }
    },

    handleIncomingMessage(msg) {
      console.log('Received message:', msg);
      if (
        (msg.senderId === this.currentUser.id && msg.receiverId === this.matchedUser.id) ||
        (msg.senderId === this.matchedUser.id && msg.receiverId === this.currentUser.id)
      ) {
        this.messages.push(msg);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    async sendMessage() {
      console.log('sendMessage called');
      if (
        !this.currentUser || !this.currentUser.id ||
        !this.matchedUser || !this.matchedUser.id
      ) {
        console.error('currentUser or matchedUser is not defined');
        return;
      }

      if (!this.message.trim()) {
        console.log('Empty message, returning');
        return;
      }

      const messageContent = this.message.trim();
      this.message = ''; // Clear input immediately
      this.sending = true;

      const messageData = {
        senderId: this.currentUser.id,
        receiverId: this.matchedUser.id,
        content: messageContent,
        timestamp: new Date().toISOString(),
      };

      try {
        console.log('Sending message:', messageData);
        socket.emit('send_message', messageData);

        // Focus back to input
        this.$refs.messageInput?.focus();

      } catch (error) {
        console.error('Error sending message:', error);
        // Restore message if sending failed
        this.message = messageContent;
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

    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  },
};
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.chat-header {
  padding: 15px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.chat-header h2 {
  margin: 0;
  font-size: 18px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #fafafa;
}

.loading-messages,
.no-messages {
  text-align: center;
  color: #666;
  padding: 20px;
}

.message {
  margin-bottom: 12px;
}

.my-message {
  text-align: right;
}

.their-message {
  text-align: left;
}

.sender {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.bubble {
  display: inline-block;
  padding: 10px 15px;
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
}

.my-message .bubble {
  background: #007bff;
  color: white;
}

.their-message .bubble {
  background: #e9ecef;
  color: #333;
}

.timestamp {
  font-size: 11px;
  color: #999;
  display: block;
  margin-top: 2px;
}

.chat-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #ddd;
  background: white;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 10px;
  outline: none;
}

.chat-input input:focus {
  border-color: #007bff;
}

.chat-input button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.chat-input button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.chat-input button:hover:not(:disabled) {
  background: #0056b3;
}

.chat-loading {
  text-align: center;
  padding: 40px;
}
</style>