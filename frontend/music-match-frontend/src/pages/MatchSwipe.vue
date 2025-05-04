<template>
  <div class="swipe-container">
    <div class="card-stack" v-if="filteredUsers.length">
      <div v-for="(user, index) in filteredUsers" :key="user.id" class="swipe-card" :class="{
        'active': index === activeCardIndex,
        'swipe-left': user.direction === 'left',
        'swipe-right': user.direction === 'right'
      }" :style="getCardStyle(index)" @mousedown="startDrag($event, index)" @touchstart="startDrag($event, index)"
        @mousemove="onDrag($event)" @touchmove="onDrag($event)" @mouseup="endDrag()" @touchend="endDrag()">
        <div class="card-inner">
          <!-- Card image -->
          <div class="card-image" :style="{ backgroundImage: `url(${getFullImageUrl(user.profileImage)})` }">
            <div class="match-badge" v-if="user.compatibility && user.compatibility > 0">
              {{ user.compatibility }}% Match
            </div>
            <div class="user-location" v-if="user.location">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {{ user.location }}
            </div>
          </div>

          <!-- Card content -->
          <div class="card-content">
            <div class="user-header">
              <h2 class="user-name">{{ user.name || 'User' }}</h2>
              <span class="user-age" v-if="user.age">{{ user.age }}</span>
            </div>

            <div class="user-bio" v-if="user.bio">
              <p :class="{ 'bio-truncated': !user.bioExpanded }">{{ user.bio }}</p>
              <button v-if="user.bio && user.bio.length > 100" class="expand-button" @click="toggleBio(user)">
                {{ user.bioExpanded ? 'Show less' : 'Show more' }}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  :class="{ 'rotate-180': user.bioExpanded }">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <!-- Shared Genres Section -->
            <div v-if="user.sharedGenres && user.sharedGenres.length" class="music-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <h3>Shared Genres</h3>
              </div>
              <div class="genres-chips">
                <span v-for="(genre, i) in user.sharedGenres" :key="i" class="genre-chip">
                  {{ genre }}
                </span>
              </div>
            </div>

            <!-- Favorite Genres Section -->
            <div v-if="user.favoriteGenres && user.favoriteGenres.length" class="music-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
                  <path d="M13.5 13.5V6a1.5 1.5 0 0 0-3 0"></path>
                </svg>
                <h3>Ihre Lieblingsgenres</h3>
              </div>
              <div class="genres-chips">
                <span v-for="(genre, i) in user.favoriteGenres" :key="'fav-' + i" class="genre-chip">
                  {{ genre }}
                </span>
              </div>
            </div>

            <!-- Favorite Artists Section -->
            <div v-if="user.favoriteArtists && user.favoriteArtists.length" class="music-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <h3>Lieblingskünstler</h3>
              </div>
              <div class="artists-list">
                <div v-for="(artist, i) in user.favoriteArtists" :key="'artist-' + i" class="artist-item">
                  <div class="artist-avatar"
                    :style="{ backgroundImage: artist && artist.image ? `url(${artist.image})` : 'none' }">
                    <span v-if="!artist || !artist.image">{{ artist && artist.name ? artist.name.charAt(0) : '?'
                      }}</span>
                  </div>
                  <span class="artist-name">{{ artist && artist.name ? artist.name : 'Unknown Artist' }}</span>
                </div>
              </div>
            </div>

            <!-- Top Tracks Section -->
            <div v-if="user.topTracks && user.topTracks.length" class="music-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <h3>Top Tracks</h3>
              </div>
              <div class="tracks-list">
                <div v-for="(track, i) in user.topTracks" :key="'track-' + i" class="track-item">
                  <span class="track-number">{{ i + 1 }}</span>
                  <div class="track-info">
                    <div class="track-title">{{ track && track.title ? track.title : 'Unknown Track' }}</div>
                    <div class="track-artist">{{ track && track.artist ? track.artist : 'Unknown Artist' }}</div>
                  </div>
                  <button class="play-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Social Media Section -->
            <div v-if="user.socialMedia" class="social-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <h3>Social Media</h3>
              </div>
              <div class="social-links">
                <a v-if="user.socialMedia && user.socialMedia.instagram" class="social-link instagram"
                  :href="'https://instagram.com/' + user.socialMedia.instagram" target="_blank">
                  @{{ user.socialMedia.instagram }}
                </a>
                <a v-if="user.socialMedia && user.socialMedia.spotify" class="social-link spotify"
                  :href="user.socialMedia.spotify" target="_blank">
                  Spotify
                </a>
              </div>
            </div>
          </div>

          <!-- Swipe indicators -->
          <div class="swipe-overlay swipe-left-overlay" :style="{ opacity: leftSwipeOpacity }">
            <div class="swipe-indicator">NOPE</div>
          </div>
          <div class="swipe-overlay swipe-right-overlay" :style="{ opacity: rightSwipeOpacity }">
            <div class="swipe-indicator">LIKE</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="action-buttons">
      <button class="action-button reject" @click="swipeLeft()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <button class="action-button like" @click="swipeRight()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
          </path>
        </svg>
      </button>
    </div>

    <!-- Empty state -->
    <div class="empty-state" v-if="filteredUsers.length === 0">
      <div class="empty-icon">💔</div>
      <h2>No more profiles</h2>
      <p>You've seen all available matches</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SwipeCards',
  data() {
    return {
      visibleUsers: [],
      activeCardIndex: 0,
      dragStartX: 0,
      dragStartY: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      isDragging: false,
      swipeThreshold: 120,
      leftSwipeOpacity: 0,
      rightSwipeOpacity: 0,
      isLoading: true,
      error: null
    }
  },
  computed: {
    filteredUsers() {
      return this.visibleUsers.filter(user => user);
    }
  },
  methods: {
    async fetchAllUsers() {
      try {
        this.isLoading = true;
        const res = await fetch('http://localhost:5000/api/users/all', {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data = await res.json();

        // Validate and transform data
        if (!data || !Array.isArray(data.users)) {
          console.warn('Received invalid user data:', data);
          this.visibleUsers = [];
          return;
        }

        // Add UI state properties to each user and ensure data integrity
        this.visibleUsers = data.users.map(user => {
          // Make sure user is an object
          if (!user || typeof user !== 'object') {
            return null;
          }

          return {
            id: user.id || `temp-${Math.random().toString(36).substring(2, 11)}`,
            name: user.name || 'Unknown User',
            age: user.age || null,
            bio: user.bio || '',
            bioExpanded: false,
            location: user.location || null,
            profileImage: user.profileImage || null,
            compatibility: user.compatibility || 0,
            sharedGenres: Array.isArray(user.sharedGenres) ? user.sharedGenres : [],
            favoriteGenres: Array.isArray(user.favoriteGenres) ? user.favoriteGenres : [],
            favoriteArtists: Array.isArray(user.favoriteArtists) ?
              user.favoriteArtists.map(artist => {
                if (!artist || typeof artist !== 'object') return { name: 'Unknown', image: null };
                return {
                  name: artist.name || 'Unknown Artist',
                  image: artist.image || null
                };
              }) : [],
            topTracks: Array.isArray(user.topTracks) ?
              user.topTracks.map(track => {
                if (!track || typeof track !== 'object') return { title: 'Unknown', artist: 'Unknown' };
                return {
                  title: track.title || 'Unknown Track',
                  artist: track.artist || 'Unknown Artist'
                };
              }) : [],
            socialMedia: user.socialMedia || null
          };
        }).filter(Boolean); // Remove null users
      } catch (err) {
        console.error('❌ Failed to fetch users:', err.message);
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    getFullImageUrl(path) {
      if (!path) return 'https://via.placeholder.com/400x500?text=No+Image';

      // Handle absolute URLs
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }

      return `http://localhost:5000${path}`;
    },

    toggleBio(user) {
      if (user) {
        user.bioExpanded = !user.bioExpanded;
      }
    },

    getCardStyle(index) {
      if (index !== this.activeCardIndex) {
        // Style for cards underneath
        const zIndex = this.filteredUsers.length - index;
        return {
          transform: `translateY(${index * 4}px) scale(${1 - (index * 0.05)})`,
          opacity: index === this.activeCardIndex + 1 ? 0.9 : 0.7 - (index * 0.1),
          zIndex: zIndex
        };
      }

      // Style for active card
      const rotation = this.dragOffsetX * 0.1;
      const scale = Math.max(1, 1 + Math.abs(this.dragOffsetX) * 0.001);

      return {
        transform: `translate(${this.dragOffsetX}px, ${this.dragOffsetY}px) rotate(${rotation}deg) scale(${scale})`,
        zIndex: this.filteredUsers.length + 1
      };
    },

    startDrag(event, index) {
      if (index !== this.activeCardIndex) return;

      this.isDragging = true;
      if (event.type.includes('mouse')) {
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
      } else if (event.touches && event.touches[0]) {
        this.dragStartX = event.touches[0].clientX;
        this.dragStartY = event.touches[0].clientY;
      }

      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    },

    onDrag(event) {
      if (!this.isDragging) return;

      let currentX, currentY;
      if (event.type.includes('mouse')) {
        currentX = event.clientX;
        currentY = event.clientY;
      } else if (event.touches && event.touches[0]) {
        currentX = event.touches[0].clientX;
        currentY = event.touches[0].clientY;
      } else {
        return; // Skip if we can't get coordinates
      }

      this.dragOffsetX = currentX - this.dragStartX;
      this.dragOffsetY = currentY - this.dragStartY;

      // Calculate swipe indicator opacity
      const maxOpacity = 1;
      if (this.dragOffsetX > 0) {
        this.rightSwipeOpacity = Math.min(maxOpacity, this.dragOffsetX / this.swipeThreshold);
        this.leftSwipeOpacity = 0;
      } else {
        this.leftSwipeOpacity = Math.min(maxOpacity, Math.abs(this.dragOffsetX) / this.swipeThreshold);
        this.rightSwipeOpacity = 0;
      }
    },

    endDrag() {
      if (!this.isDragging) return;
      this.isDragging = false;

      if (this.dragOffsetX > this.swipeThreshold) {
        this.swipeRight();
      } else if (this.dragOffsetX < -this.swipeThreshold) {
        this.swipeLeft();
      } else {
        // Reset position if not swiped far enough
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.leftSwipeOpacity = 0;
        this.rightSwipeOpacity = 0;
      }
    },

    swipeLeft() {
      if (this.filteredUsers.length === 0) return;

      // Mark the card as swiped left
      if (this.visibleUsers[this.activeCardIndex]) {
        this.visibleUsers[this.activeCardIndex].direction = 'left';

        // Remove card after animation completes
        setTimeout(() => {
          this.visibleUsers.splice(this.activeCardIndex, 1);
          // Reset swipe indicators
          this.dragOffsetX = 0;
          this.dragOffsetY = 0;
          this.leftSwipeOpacity = 0;
          this.rightSwipeOpacity = 0;
        }, 300);
      }
    },

    swipeRight() {
      if (this.filteredUsers.length === 0) return;

      // Mark the card as swiped right
      if (this.visibleUsers[this.activeCardIndex]) {
        this.visibleUsers[this.activeCardIndex].direction = 'right';

        // Send match data to backend
        this.sendMatchToBackend(this.filteredUsers[this.activeCardIndex].id);

        // Remove card after animation completes
        setTimeout(() => {
          this.visibleUsers.splice(this.activeCardIndex, 1);
          // Reset swipe indicators
          this.dragOffsetX = 0;
          this.dragOffsetY = 0;
          this.leftSwipeOpacity = 0;
          this.rightSwipeOpacity = 0;
        }, 300);
      }
    },

    sendMatchToBackend(userId) {
      if (!userId) return;

      fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
          }
          return response.json();
        })
        .then(data => console.log('Match successful:', data))
        .catch(err => console.error('Failed to send match:', err));
    }
  },
  mounted() {
    this.fetchAllUsers();
  }
}
</script>
<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.swipe-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
  padding: 0 20px;
}

.card-stack {
  position: relative;
  width: 100%;
  max-width: 380px;
  height: 650px;
  margin-bottom: 20px;
}

.swipe-card {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease, opacity 0.2s ease;
  cursor: grab;
  perspective: 1000px;
  will-change: transform;
}

.swipe-card.active {
  cursor: grabbing;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  background-color: white;
  transform-style: preserve-3d;
  display: flex;
  flex-direction: column;
}

.card-image {
  width: 100%;
  height: 55%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.match-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 14px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.user-location {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(4px);
}

.card-content {
  flex: 1;
  padding: 20px;
  background: white;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #111;
}

.user-age {
  font-size: 24px;
  font-weight: 500;
  color: #555;
}

.user-bio {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  position: relative;
}

.bio-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.expand-button {
  background: none;
  border: none;
  color: #6d28d9;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.rotate-180 {
  transform: rotate(180deg);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.section-header h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.section-header svg {
  color: #6d28d9;
}

.music-section {
  margin-bottom: 10px;
}

.genres-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.genre-chip {
  display: inline-block;
  background-color: #edf2f7;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.genre-chip:hover {
  background-color: #e2e8f0;
}

.artists-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.artist-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(33.333% - 8px);
}

.artist-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ddd;
  background-size: cover;
  background-position: center;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #555;
}

.artist-name {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: #444;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.track-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f7f9fc;
  border-radius: 12px;
}

.track-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  color: #6d28d9;
  margin-right: 10px;
}

.track-info {
  flex: 1;
  overflow: hidden;
}

.track-title {
  font-weight: 600;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-button {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #6d28d9;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-button:hover {
  background-color: #5b21b6;
  transform: scale(1.05);
}

.social-section {
  margin-top: 4px;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-link {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-link.instagram {
  background-color: #fcecf3;
  color: #e1306c;
}

.social-link.spotify {
  background-color: #ebf8ed;
  color: #1DB954;
}

.swipe-overlay {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.swipe-left-overlay {
  background-color: rgba(239, 68, 68, 0.15);
  left: 0;
}

.swipe-right-overlay {
  background-color: rgba(16, 185, 129, 0.15);
  right: 0;
}

.swipe-indicator {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 28px;
  transform: rotate(-20deg);
  border: 4px solid;
  letter-spacing: 2px;
}

.swipe-left-overlay .swipe-indicator {
  color: #ef4444;
  border-color: #ef4444;
}

.swipe-right-overlay .swipe-indicator {
  color: #10b981;
  border-color: #10b981;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 20px;
}

.action-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  transform: scale(1.1);
}

.reject {
  background-color: white;
  color: #ef4444;
  border: 2px solid #ef4444;
}

.reject:hover {
  background-color: #ef4444;
  color: white;
}

.like {
  background-color: white;
  color: #10b981;
  border: 2px solid #10b981;
}

.like:hover {
  background-color: #10b981;
  color: white;
}

.swipe-card.swipe-left {
  transform: translateX(-150%) rotate(-30deg) !important;
  opacity: 0 !important;
  transition: transform 0.3s ease, opacity 0.2s ease;
}

.swipe-card.swipe-right {
  transform: translateX(150%) rotate(30deg) !important;
  opacity: 0 !important;
  transition: transform 0.3s ease, opacity 0.2s ease;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 28px;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 16px;
  color: #888;
}

@media (max-width: 480px) {
  .card-stack {
    height: 580px;
  }

  .action-button {
    width: 56px;
    height: 56px;
  }

  .user-name {
    font-size: 24px;
  }

  .user-age {
    font-size: 20px;
  }
}

/* Scrollbar styling */
.card-content::-webkit-scrollbar {
  width: 4px;
}

.card-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.card-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}

/* Additional animation effects */
.action-button svg {
  transition: transform 0.2s ease;
}

.action-button:hover svg {
  transform: scale(1.2);
}

/* Add focus states for accessibility */
.action-button:focus,
.expand-button:focus,
.play-button:focus {
  outline: 2px solid #6d28d9;
  outline-offset: 2px;
}

/* Add touch device optimizations */
@media (hover: none) {
  .action-button {
    width: 70px;
    height: 70px;
  }

  .swipe-indicator {
    font-size: 36px;
    padding: 12px 24px;
  }
}
</style>