<template>
  <div v-if="currentUser && matchedUser" class="chat-view">
    <div class="chat-header">
      <h2>Chat with {{ matchedUser?.name || 'User' }}</h2>
    </div>
    <div class="chat-messages">
      <div v-for="msg in messages" :key="msg.id"
        :class="{ 'my-message': msg.senderId === currentUser.id, 'their-message': msg.senderId !== currentUser.id }">
        <span class="sender">{{ msg.sender?.name || (msg.senderId === currentUser.id ? 'You' : '') }}</span>
        <div class="bubble">{{ msg.content }}</div>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Type your message..."
        :disabled="!currentUser || !matchedUser" />
      <button @click="sendMessage" :disabled="!currentUser || !matchedUser">Send</button>
    </div>
  </div>
  <div v-else>
    <p>Loading chat...</p>
  </div>
</template>

<script>
import socket from 'boot/socket';
import axios from 'axios';

export default {
  props: {
    matchedUser: { type: Object, required: true },
    currentUser: { type: Object, required: true }
  },
  data() {
    return {
      message: '',
      messages: [],
      chatInitialized: false,
    };
  },
  watch: {
    currentUser: {
      handler() {
        this.tryInitChat();
      },
      immediate: true,
    },
    matchedUser: {
      handler() {
        this.tryInitChat();
      },
      immediate: true,
    }
  },
  methods: {
    async tryInitChat() {
      if (
        !this.currentUser || !this.currentUser.id ||
        !this.matchedUser || !this.matchedUser.id
      ) {
        return;
      }
      // Prevent double initialization
      if (this.chatInitialized) return;
      this.chatInitialized = true;

      socket.emit('user_connected', this.currentUser.id);

      // load history
      const { data } = await axios.get(`/api/chat/${this.matchedUser.id}`, { withCredentials: true });
      this.messages = data;

      // real-time incoming
      socket.on('receive_message', msg => {
        if (
          (msg.senderId === this.currentUser.id && msg.receiverId === this.matchedUser.id) ||
          (msg.senderId === this.matchedUser.id && msg.receiverId === this.currentUser.id)
        ) {
          this.messages.push(msg);
        }
      });
    },
    sendMessage() {
      if (
        !this.currentUser || !this.currentUser.id ||
        !this.matchedUser || !this.matchedUser.id
      ) {
        console.error('currentUser or matchedUser is not defined');
        return;
      }
      if (!this.message.trim()) return;
      socket.emit('send_message', {
        senderId: this.currentUser.id,
        receiverId: this.matchedUser.id,
        content: this.message.trim(),
      });
      this.message = '';
    },
  },
};
</script>

<style scoped>
/* Style as you want, e.g. */
.chat-view {
  /* ... */
}

.chat-header {
  /* ... */
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 10px;
  background: #f8f8f8;
}

.my-message {
  text-align: right;
  color: #6d28d9;
}

.their-message {
  text-align: left;
  color: #222;
}

.bubble {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  background: #eee;
  margin: 3px 0;
}

.chat-input {
  display: flex;
  gap: 10px;
}
</style>