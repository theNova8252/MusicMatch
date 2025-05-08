<!-- Add this as a new component: MatchPopup.vue --><template>
  <transition name="match-popup">
    <div v-if="visible" class="match-popup-overlay" @click="handleBackgroundClick">
      <div class="match-popup-container" @click.stop>
        <div class="match-header">
          <div class="match-title">
            <div class="match-emoji">💖</div>
            <h2>It's a Match!</h2>
          </div>
          <button class="close-button" @click="closePopup">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="match-profiles">
          <div class="profile">
            <div class="profile-image"
              :style="{ backgroundImage: currentUser ? `url(${getFullImageUrl(currentUser.profileImage)})` : '' }">
              <div class="profile-circle"></div>
            </div>
            <p class="profile-name">{{ currentUser.name }}</p>
          </div>

          <div class="match-center">
            <div class="heart-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#ff2e7e"
                stroke="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                </path>
              </svg>
            </div>
          </div>

          <div class="profile">
            <div class="profile-image"
              :style="{ backgroundImage: `url(${getFullImageUrl(matchedUser?.profileImage)})` }">
              <div class="profile-circle"></div>
            </div>
            <p class="profile-name">{{ matchedUser?.name || 'Match' }}</p>
          </div>
        </div>

        <div class="match-compatibility" v-if="matchedUser && matchedUser.compatibility">
          <div class="compatibility-bar">
            <div class="compatibility-fill" :style="{ width: `${matchedUser.compatibility}%` }"></div>
          </div>
          <p class="compatibility-text">{{ matchedUser.compatibility }}% Music Match</p>
        </div>

        <div class="match-message">
          <p>You and {{ matchedUser?.name || 'your match' }} liked each other!</p>
        </div>

        <div class="shared-music"
          v-if="matchedUser && (matchedUser.sharedArtists?.length || matchedUser.sharedGenres?.length)">
          <h3>Your Shared Music Taste</h3>

          <div v-if="matchedUser.sharedArtists?.length" class="music-section">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              Shared Artists
            </h4>
            <div class="shared-chips">
              <span v-for="(artist, i) in matchedUser.sharedArtists.slice(0, 3)" :key="i" class="shared-chip">
                {{ artist }}
              </span>
              <span v-if="matchedUser.sharedArtists.length > 3" class="more-chip">
                +{{ matchedUser.sharedArtists.length - 3 }} more
              </span>
            </div>
          </div>

          <div v-if="matchedUser.sharedGenres?.length" class="music-section">
            <h4>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
              Shared Genres
            </h4>
            <div class="shared-chips">
              <span v-for="(genre, i) in matchedUser.sharedGenres.slice(0, 3)" :key="i" class="shared-chip">
                {{ genre }}
              </span>
              <span v-if="matchedUser.sharedGenres.length > 3" class="more-chip">
                +{{ matchedUser.sharedGenres.length - 3 }} more
              </span>
            </div>
          </div>
        </div>

        <div class="match-actions">
          <button class="action-button continue" @click="closePopup">
            Keep Swiping
          </button>
          <button class="action-button message" @click="goToChat">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Send Message
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MatchPopup',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    matchedUser: {
      type: Object,
      default: null
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  methods: {
    closePopup() {
      this.$emit('close');
    },
    handleBackgroundClick() {
      this.closePopup();
    },
    goToChat() {
      // Navigate to chat with this user
      if (this.matchedUser && this.matchedUser.id) {
        this.$router.push(`/chat/${this.matchedUser.id}`);
      }
      this.closePopup();
    },
    getFullImageUrl(path) {
      if (!path) return 'https://via.placeholder.com/300x300?text=No+Image';
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      return `http://localhost:5000${path}`;
    }
  }
}
</script>

<style scoped>
.match-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.match-popup-container {
  background: white;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.match-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.match-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.match-emoji {
  font-size: 28px;
  animation: pulse 1.5s infinite;
}

.match-title h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(90deg, #6d28d9, #db2777);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.close-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f0f0f0;
  color: #555;
}

.match-profiles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.5s ease-out;
}

.profile-circle {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
  border: 2px solid #6d28d9;
  animation: pulseBorder 2s infinite;
}

.profile-name {
  margin-top: 10px;
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.match-center {
  width: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.heart-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: heartBeat 1.5s infinite;
}

.heart-icon svg {
  width: 24px;
  height: 24px;
}

.match-compatibility {
  padding: 0 20px 15px;
  text-align: center;
}

.compatibility-bar {
  height: 6px;
  background-color: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 5px;
}

.compatibility-fill {
  height: 100%;
  background: linear-gradient(90deg, #6d28d9, #db2777);
  border-radius: 3px;
  transition: width 1s ease-out;
}

.compatibility-text {
  font-size: 14px;
  color: #6d28d9;
  font-weight: 600;
  margin: 0;
}

.match-message {
  padding: 0 20px 15px;
  text-align: center;
}

.match-message p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.shared-music {
  padding: 0 20px 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 15px;
  padding-top: 15px;
}

.shared-music h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  text-align: center;
}

.music-section {
  margin-bottom: 15px;
}

.music-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #555;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.music-section svg {
  color: #6d28d9;
}

.shared-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.shared-chip {
  padding: 5px 10px;
  background-color: #f0ebfa;
  color: #6d28d9;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.more-chip {
  padding: 5px 10px;
  background-color: #eee;
  color: #666;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.match-actions {
  display: flex;
  padding: 15px 20px 20px;
  gap: 10px;
}

.action-button {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-button.continue {
  background-color: #f5f5f5;
  color: #555;
}

.action-button.continue:hover {
  background-color: #eee;
}

.action-button.message {
  background-color: #6d28d9;
  color: white;
}

.action-button.message:hover {
  background-color: #5c21b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(109, 40, 217, 0.3);
}

/* Animations */
@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

@keyframes heartBeat {

  0%,
  100% {
    transform: scale(1);
  }

  15% {
    transform: scale(1.3);
  }

  30% {
    transform: scale(1);
  }

  45% {
    transform: scale(1.3);
  }
}

@keyframes pulseBorder {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 0.4;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Transition effects */
.match-popup-enter-active,
.match-popup-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.match-popup-enter-from,
.match-popup-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive design */
@media (max-width: 480px) {
  .match-popup-container {
    max-width: 100%;
    border-radius: 20px;
  }

  .profile-image {
    width: 80px;
    height: 80px;
  }

  .match-title h2 {
    font-size: 22px;
  }
}
</style>