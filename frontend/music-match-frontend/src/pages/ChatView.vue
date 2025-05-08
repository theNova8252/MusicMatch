<!-- Main chat view component that renders the conversation -->
<template>
  <div class="chat-view">
    <header class="chat-header">
      <div class="back-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </div>
      <div class="user-info" v-if="chatPartner">
        <div class="profile-image" :style="{ backgroundImage: `url(${getFullImageUrl(chatPartner.profileImage)})` }">
        </div>
        <div class="user-details">
          <h3>{{ chatPartner.name }}</h3>
          <span class="status" :class="{ 'online': chatPartner.isOnline }">
            {{ chatPartner.isOnline ? 'Online' : 'Offline' }}
          </span>
        </div>
      </div>
      <div class="menu-button" @click="toggleOptions">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </div>
      <div class="chat-options" v-if="showOptions">
        <div class="option" @click="viewProfile">View Profile</div>
        <div class="option" @click="clearChat">Clear Chat</div>
        <div class="option unmatch" @click="unmatchUser">Unmatch</div>
      </div>
    </header>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>

      <div v-else-if="messages.length === 0" class="empty-chat">
        <div class="empty-chat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3>Start the conversation</h3>
        <p>Say hello to {{ chatPartner?.name || 'your match' }}!</p>
      </div>

      <template v-else>
        <div v-for="(messageGroup, date) in groupedMessages" :key="date">
          <div class="date-divider">
            <span>{{ formatDate(date) }}</span>
          </div>

          <div v-for="message in messageGroup" :key="message.id" class="message-wrapper"
            :class="{ 'outgoing': message.senderId === currentUser.id }">
            <div class="message" :class="{ 'outgoing': message.senderId === currentUser.id }">
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="chat-input-container">
      <div class="action-buttons">
        <button class="action-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </button>
        <button class="action-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        </button>
      </div>

      <div class="input-wrapper">
        <textarea v-model="newMessage" placeholder="Type a message..." @keydown.enter.prevent="sendMessage"
          ref="messageInput" rows="1" @input="resizeTextarea"></textarea>
      </div>

      <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>

    <div class="confirmation-dialog" v-if="showConfirmation">
      <div class="confirmation-content">
        <h3>{{ confirmationTitle }}</h3>
        <p>{{ confirmationMessage }}</p>
        <div class="confirmation-buttons">
          <button class="cancel-button" @click="cancelConfirmation">Cancel</button>
          <button class="confirm-button" @click="confirmAction">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
  import {ref, computed, onMounted, onUnmounted, nextTick, watch} from 'vue';
  import {useStore} from 'vuex'; // ❌ Prefer Pinia eventually, but if needed temporarily ok
  import {useChatStore} from '../store/chatStore'; // ✅ Make sure this is a Pinia store!
  import {useRouter} from 'vue-router';
  import {useEventBus} from '../composables/useEventBus'; // ✅ You must create/use this if needed

  const props = defineProps({
    partnerId: {
    type: String,
  required: true
  }
});

  const store = useStore();
  const router = useRouter();
  const chatStore = useChatStore();
  const eventBus = useEventBus();

  const loading = ref(true);
  const newMessage = ref('');
  const showOptions = ref(false);
  const showConfirmation = ref(false);
  const confirmationTitle = ref('');
  const confirmationMessage = ref('');
  const messagesContainer = ref(null);
  const messageInput = ref(null);

const currentUser = computed(() => store.state.currentUser);
const chatPartner = computed(() => store.getters.getUserById(props.partnerId));
const messages = computed(() => chatStore.messages);

const groupedMessages = computed(() => {
  const groups = { };
  messages.value.forEach(message => {
    const date = new Date(message.timestamp).toLocaleDateString();
  if (!groups[date]) {
    groups[date] = [];
    }
  groups[date].push(message);
  });
  return groups;
});

const scrollToBottom = () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
};

const fetchMessages = async () => {
  try {
    loading.value = true;
  const res = await fetch(`/api/chat/${props.partnerId}`, {
    credentials: 'include'
    });
  chatStore.setMessages(await res.json());
  } catch (err) {
    console.error(err);
  chatStore.setMessages([]);
  } finally {
    loading.value = false;
  scrollToBottom();
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  const message = {
    id: Date.now().toString(),
  content: newMessage.value.trim(),
  senderId: currentUser.value.id,
  receiverId: props.partnerId,
  timestamp: new Date().toISOString(),
  read: false
  };
  chatStore.push(message);
  newMessage.value = '';
  resizeTextarea();
  scrollToBottom();

  try {
    await fetch('/api/chat/send', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverId: props.partnerId,
        content: message.content
      })
    });
  } catch (e) {
    console.error('Error sending message', e);
  }
};

const resizeTextarea = () => {
  if (messageInput.value) {
    messageInput.value.style.height = 'auto';
  messageInput.value.style.height = Math.min(150, messageInput.value.scrollHeight) + 'px';
  }
};

const getFullImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x300?text=No+Image';
  return path.startsWith('http') ? path : `http://localhost:5000${path}`;
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric' });
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: true });
};

const goBack = () => router.back();

const toggleOptions = () => showOptions.value = !showOptions.value;

const viewProfile = () => {
    showOptions.value = false;
  router.push(`/profile/${props.partnerId}`);
};

// And your unmatch/clear/confirm functions go here...

// Socket listener setup
onMounted(() => {
    eventBus.on('socket-message', handleSocketMessage);
  fetchMessages();
});
onUnmounted(() => {
    eventBus.off('socket-message', handleSocketMessage);
});
watch(() => messages.value.length, scrollToBottom);

  function handleSocketMessage(data) {
  const parsed = JSON.parse(data);
  if (parsed.type === 'new-message') {
    const msg = parsed.message;
  if (msg.senderId === props.partnerId || msg.receiverId === props.partnerId) {
    chatStore.push(msg);
  scrollToBottom();
    }
  }
}
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9f9f9;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid #eee;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
}

.back-button {
  padding: 8px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 12px;
}

.back-button:hover {
  background-color: #f0f0f0;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  margin-right: 12px;
}

.user-details h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.status {
  font-size: 12px;
  color: #888;
}

.status.online {
  color: #10b981;
}

.status.online::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 4px;
}

.menu-button {
  padding: 8px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.menu-button:hover {
  background-color: #f0f0f0;
}

.chat-options {
  position: absolute;
  top: 100%;
  right: 16px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 150px;
  z-index: 100;
}

.option {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
}

.option:hover {
  background-color: #f5f5f5;
}

.option.unmatch {
  color: #e11d48;
}

.option.unmatch:hover {
  background-color: #fee2e2;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6d28d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  text-align: center;
  padding: 20px;
}

.empty-chat-icon {
  margin-bottom: 16px;
  color: #6d28d9;
  opacity: 0.7;
}

.empty-chat h3 {
  margin: 0 0 8px;
  font-weight: 600;
  color: #333;
}

.empty-chat p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.date-divider {
  text-align: center;
  margin: 16px 0;
  position: relative;
}

.date-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #eee;
  z-index: 1;
}

.date-divider span {
  position: relative;
  z-index: 2;
  background-color: #f9f9f9;
  padding: 0 12px;
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;
}

.message-wrapper.outgoing {
  justify-content: flex-end;
}

.message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
}

.message.outgoing {
  background-color: #6d28d9;
  color: white;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.message-time {
  font-size: 10px;
  color: #888;
  text-align: right;
  margin-top: 4px;
}

.message.outgoing .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.chat-input-container {
  padding: 12px 16px;
  background-color: white;
  border-top: 1px solid #eee;
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  color: #6d28d9;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.action-button:hover {
  background-color: rgba(109, 40, 217, 0.1);
}

.input-wrapper {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 24px;
  padding: 8px 16px;
  min-height: 40px;
  display: flex;
  align-items: center;
}

textarea {
  width: 100%;
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  resize: none;
  padding: 0;
  line-height: 1.4;
  height: auto;
  max-height: 150px;
  outline: none;
  font-family: inherit;
}

textarea::placeholder {
  color: #888;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #6d28d9;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-button:hover {
  background-color: #5c21b9;
  transform: scale(1.05);
}

.send-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.confirmation-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirmation-content {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 320px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.confirmation-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  color: #333;
}

.confirmation-content p {
  margin-bottom: 24px;
  font-size: 14px;
  color: #666;
}

.confirmation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.confirmation-buttons button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #333;
  border: none;
}

.confirm-button {
  background-color: #6d28d9;
  color: white;
  border: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .message {
    max-width: 85%;
  }
}
</style>