<template>
  
  <div class="swipe-container" :class="{ 'dark-mode': isDarkMode }">
  
    <button class="back-button" @click="navigateToDashboard">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Dashboard</span>
    </button>
    <button class="chat-button" @click="navigateToChats">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Chats</span>
    </button>
    <button class="darkmode-toggle" @click="toggleDarkMode" :aria-pressed="isDarkMode">
      <svg v-if="!isDarkMode" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 A7 7 0 0 0 21 12.79z" />
      </svg>
    </button>

    <div class="card-stack" v-if="filteredUsers.length">
      <div v-for="(user, index) in filteredUsers" :key="user.id" class="swipe-card" :class="{
        'active': index === activeCardIndex,
        'swipe-left': user.direction === 'left',
        'swipe-right': user.direction === 'right'
      }" :style="getCardStyle(index)">
        <div class="card-inner">
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

            <div class="music-match-section">
              <div class="music-match-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <h3>Music Match</h3>
                <div class="match-percentage">{{ user.compatibility }}%</div>
              </div>
            </div>
            <div v-if="user.currentlyPlaying" class="music-section currently-playing">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M7 15.5l2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5"></path>
                </svg>
                <h3>Currently Playing</h3>
              </div>
              <div class="current-track">
                <div class="playing-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="current-track-info">
                  <div class="current-track-title">{{ user.currentlyPlaying.title }}</div>
                  <div class="current-track-artist">{{ user.currentlyPlaying.artist }}</div>
                </div>
              </div>
            </div>
            <div v-if="user.recentlyPlayed && user.recentlyPlayed.length" class="music-section recently-played">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="17 1 21 5 17 9"></polyline>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                  <polyline points="7 23 3 19 7 15"></polyline>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                </svg>
                <h3>Recently Played</h3>
              </div>
              <div class="recent-tracks-list">
                <div v-for="(track, i) in user.recentlyPlayed.slice(0, 3)" :key="'recent-' + i" class="track-item">
                  <div class="track-item">
                    <img v-if="track.albumImage" :src="track.albumImage" alt="Album Cover" class="album-cover" />
                    <div class="track-meta">
                      <div class="track-timing">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{{ formatTimeSince(track.playedAt) }}</span>
                      </div>
                      <div class="track-info">
                        <div class="track-title">{{ track.title || 'Unknown Track' }}</div>
                        <div class="track-artist">{{ track.artist || 'Unknown Artist' }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="user.sharedArtists && user.sharedArtists.length" class="music-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <h3>Shared Artists</h3>
              </div>
              <div class="artists-list">
                <div v-for="(artist, i) in parseSharedArtists(user.sharedArtists)" :key="'shared-artist-' + i"
                  class="artist-item">
                  <div class="artist-avatar">
                    <span>{{ artist.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="artist-name">{{ artist }}</span>
                </div>
              </div>
            </div>


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

            <div v-if="user.favoriteGenres && user.favoriteGenres.length" class="music-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"></path>
                  <path d="M13.5 13.5V6a1.5 1.5 0 0 0-3 0"></path>
                </svg>
                <h3>Favorite Genres</h3>
              </div>
              <div class="genres-chips">
                <span v-for="(genre, i) in user.favoriteGenres" :key="'fav-' + i" class="genre-chip">
                  {{ genre }}
                </span>
              </div>
            </div>

            <div v-if="user.favoriteArtists" class="music-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                <h3>Favorite Artists</h3>
              </div>
              <div class="artists-list">
                <div v-for="(artist, i) in parseArtists(user.favoriteArtists)" :key="'artist-' + i" class="artist-item">
                  <div class="artist-avatar">
                    <span>{{ artist.charAt(0).toUpperCase() }}</span>
                  </div>
                  <span class="artist-name">{{ artist }}</span>
                </div>
              </div>
            </div>

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
                </div>
              </div>
            </div>

            <div v-if="user.socialMedia" class="social-section">
              <div class="section-header">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 A4 4 0 0 1 16 11.37z"></path>
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

          <div class="swipe-overlay swipe-left-overlay" :style="{ opacity: leftSwipeOpacity }">
            <div class="swipe-indicator">NOPE</div>
          </div>
          <div class="swipe-overlay swipe-right-overlay" :style="{ opacity: rightSwipeOpacity }">
            <div class="swipe-indicator">LIKE</div>
          </div>
        </div>
      </div>
    </div>

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

    <div class="empty-state" v-if="filteredUsers.length === 0">
      <div class="empty-icon">💔</div>
      <h2>No more profiles</h2>
      <p>You've seen all available matches</p>
      <button class="go-to-dashboard" @click="navigateToDashboard">Return to Dashboard</button>
    </div>
    <MatchPopup :visible="showMatchPopup" :matchedUser="matchedUser" :currentUser="currentUser"
      :sharedMusic="sharedMusic" @close="showMatchPopup = false" />
  </div>

</template>

<script>
import MatchPopup from '../components/MatchPopup.vue';
import socket from 'src/boot/socket';
export default {
  name: 'SwipeCards',
  components: {
    MatchPopup
  },
  data() {
    return {
      visibleUsers: [],
      activeCardIndex: 0,
      dragOffsetX: 0,
      dragOffsetY: 0,
      leftSwipeOpacity: 0,
      rightSwipeOpacity: 0,
      isLoading: true,
      error: null,
      showMatchPopup: false,
      matchedUser: null,
      seenUserIds: new Set(),
      sharedMusic: { artists: [], genres: [] },
      currentUser: {},
      isDarkMode: false,
      lastSwipedUser: null,
    }
  },
  computed: {
    filteredUsers() {
      return this.visibleUsers.filter(user => user);
    },
  },
  watch: {
    '$store.state.user': {
      handler() {
        this.currentUser = this.getProcessedCurrentUser();
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    async fetchAllUsers() {
      try {
        const res = await fetch('http://localhost:5000/api/users/all', {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data = await res.json();

        if (!data || !Array.isArray(data.users)) {
          console.warn('Received invalid user data:', data);
          this.visibleUsers = [];
          return;
        }

        const newUserData = data.users;

        if (this.visibleUsers.length === 0) {
          this.visibleUsers = newUserData
            .filter(user => !this.seenUserIds.has(user.id))
            .map(user => {
              if (!user || typeof user !== 'object') return null;

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
                sharedArtists: Array.isArray(user.sharedArtists) ? user.sharedArtists : [],
                favoriteGenres: Array.isArray(user.favoriteGenres) ? user.favoriteGenres : [],
                favoriteArtists: user.favoriteArtists || '',
                topTracks: Array.isArray(user.topTracks) ?
                  user.topTracks.map(track => {
                    if (!track || typeof track !== 'object') return { title: 'Unknown', artist: 'Unknown' };
                    return {
                      title: track.title || 'Unknown Track',
                      artist: track.artist || 'Unknown Artist'
                    };
                  }) : [],
                socialMedia: user.socialMedia || null,
                currentlyPlaying: user.currentlyPlaying ? {
                  title: user.currentlyPlaying.title || 'Unknown Track',
                  artist: user.currentlyPlaying.artist || 'Unknown Artist',
                  uri: user.currentlyPlaying.uri || null,
                  albumImage: user.currentlyPlaying.albumImage || null,
                } : null,
                recentlyPlayed: Array.isArray(user.recentlyPlayed) ?
                  user.recentlyPlayed.map(track => {
                    if (!track || typeof track !== 'object') return {
                      title: 'Unknown',
                      artist: 'Unknown',
                      playedAt: null
                    };
                    return {
                      title: track.title || 'Unknown Track',
                      artist: track.artist || 'Unknown Artist',
                      playedAt: track.playedAt || null,
                      uri: track.uri || null,
                      albumImage: track.albumImage || null
                    };
                  }) : [],
              };
            }).filter(Boolean);

        } else {
          newUserData.forEach(newUser => {
            const existing = this.visibleUsers.find(u => u.id === newUser.id);
            if (existing && newUser.currentlyPlaying) {
              existing.currentlyPlaying = {
                title: newUser.currentlyPlaying.title || 'Unknown Track',
                artist: newUser.currentlyPlaying.artist || 'Unknown Artist',
                uri: newUser.currentlyPlaying.uri || null,
                albumImage: newUser.currentlyPlaying.albumImage || null,
              };
            }
          });
        }

      } catch (err) {
        console.error('❌ Failed to fetch users:', err.message);
        this.error = err.message;
      }
    },
    async fetchCurrentUser() {
      try {
        const res = await fetch('http://localhost:5000/api/users/me', {
          credentials: 'include'
        });
        const data = await res.json();

        if (data.user) {
          this.$store.commit('setUser', data.user);
          this.currentUser = this.getProcessedCurrentUser();
        }
      } catch (err) {
        console.error('❌ Failed to fetch current user:', err);
      }
    },
    getProcessedCurrentUser() {
      const user = this.$store.state.user || {};
      const image = user.profileImage;

      if (!image) return { ...user, profileImage: null };

      const isFullUrl = image.startsWith('http://') || image.startsWith('https://');

      return {
        ...user,
        profileImage: isFullUrl ? image : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`
      };
    },
    async playSpotifyTrack(uri) {
      if (!uri) return;
      try {
        await fetch('https://api.spotify.com/v1/me/player/play', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.$root.spotifyAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uris: [uri] }),
        });
        console.log('Track started!');
      } catch (err) {
        console.error('Failed to play track:', err);
      }
    },
    formatTimeSince(timestamp) {
      if (!timestamp) return 'Recently';

      const now = new Date();
      const playedTime = new Date(timestamp);
      const diffMs = now - playedTime;

      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 60) {
        return diffMins === 1 ? '1 min ago' : `${diffMins} mins ago`;
      }

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) {
        return diffHours === 1 ? '1 hr ago' : `${diffHours} hrs ago`;
      }

      const diffDays = Math.floor(diffHours / 24);
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    },
    parseArtists(artistsString) {
      if (!artistsString || typeof artistsString !== 'string') return [];
      return artistsString.split(',').map(artist => artist.trim()).filter(Boolean);
    },
    parseSharedArtists(sharedArtistsArray) {
      if (!Array.isArray(sharedArtistsArray)) return [];
      return sharedArtistsArray;
    },
    getFullImageUrl(path) {
      if (!path || typeof path !== 'string') {
        return 'https://via.placeholder.com/400x500?text=No+Image';
      }
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      return `${window.location.origin}${path}`;
    },
    navigateToDashboard() {
      this.$router.push('/dashboard');
    },
    navigateToChats(){
      this.$router.push('/chats');
    },
    toggleBio(user) {
      if (user) {
        user.bioExpanded = !user.bioExpanded;
      }
    },
    getCardStyle(index) {
      if (index !== this.activeCardIndex) {
        const zIndex = this.filteredUsers.length - index;
        return {
          transform: `translateY(${index * 4}px) scale(${1 - (index * 0.05)})`,
          opacity: index === this.activeCardIndex + 1 ? 0.9 : 0.7 - (index * 0.1),
          zIndex: zIndex
        };
      }

      return {
        transform: `translate(${this.dragOffsetX}px, ${this.dragOffsetY}px)`,
        zIndex: this.filteredUsers.length + 1
      };
    },
    swipeLeft() {
      if (this.filteredUsers.length === 0) return;

      if (this.visibleUsers[this.activeCardIndex]) {
        const userId = this.visibleUsers[this.activeCardIndex].id;
        this.seenUserIds.add(userId);
        this.visibleUsers[this.activeCardIndex].direction = 'left';

        setTimeout(() => {
          this.visibleUsers.splice(this.activeCardIndex, 1);
          this.dragOffsetX = 0;
          this.dragOffsetY = 0;
          this.leftSwipeOpacity = 0;
          this.rightSwipeOpacity = 0;
        }, 300);
      }
    },
    swipeRight() {
      if (this.filteredUsers.length === 0) return;

      const swipedUser = this.visibleUsers[this.activeCardIndex];
      if (swipedUser) {
        this.lastSwipedUser = { ...swipedUser }; // keep a copy before removal
        const userId = swipedUser.id;
        this.seenUserIds.add(userId);
        this.visibleUsers[this.activeCardIndex].direction = 'right';
        // Call likeUser after setting lastSwipedUser
        this.likeUser(userId);

        setTimeout(() => {
          this.visibleUsers.splice(this.activeCardIndex, 1);
          this.dragOffsetX = 0;
          this.dragOffsetY = 0;
          this.leftSwipeOpacity = 0;
          this.rightSwipeOpacity = 0;
        }, 300);
      }
    },
    async likeUser(userId) {
      try {
        const res = await fetch(`http://localhost:5000/api/users/like/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed like: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        if (data.mutualMatch) {
          // Always show the popup here, regardless of socket event
          if (!this.lastSwipedUser) {
            console.error('❌ No last swiped user stored');
            return;
          }
          this.currentUser = this.getProcessedCurrentUser();
          this.matchedUser = {
            ...this.lastSwipedUser,
            profileImage: this.getFullImageUrl(this.lastSwipedUser.profileImage)
          };
          this.sharedMusic = this.getSharedMusic(this.currentUser, this.lastSwipedUser);
          this.showMatchPopup = true;

          // Optionally, emit a socket event to yourself for local dev
          // socket.emit('mutualMatch', { user: this.matchedUser, sharedMusic: this.sharedMusic });
        }
      } catch (err) {
        console.error('Failed to like user:', err);
      }
    },
    getSharedMusic(currentUser, matchedUser) {
      // Ensure both are arrays
      const currentArtists = Array.isArray(currentUser.favoriteArtists)
        ? currentUser.favoriteArtists
        : (typeof currentUser.favoriteArtists === 'string'
          ? currentUser.favoriteArtists.split(',').map(a => a.trim()).filter(Boolean)
          : []);
      const matchedArtists = Array.isArray(matchedUser.favoriteArtists)
        ? matchedUser.favoriteArtists
        : (typeof matchedUser.favoriteArtists === 'string'
          ? matchedUser.favoriteArtists.split(',').map(a => a.trim()).filter(Boolean)
          : []);

      const sharedArtists = currentArtists.filter(artist =>
        matchedArtists.includes(artist)
      );

      const currentGenres = Array.isArray(currentUser.favoriteGenres)
        ? currentUser.favoriteGenres
        : [];
      const matchedGenres = Array.isArray(matchedUser.favoriteGenres)
        ? matchedUser.favoriteGenres
        : [];

      const sharedGenres = currentGenres.filter(genre =>
        matchedGenres.includes(genre)
      );

      return { artists: sharedArtists, genres: sharedGenres };
    },
    closeMatchPopup() {
      this.showMatchPopup = false;
      this.matchedUser = null;
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;

      // Apply dark mode class to both document elements
      document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
      document.body.classList.toggle('dark-mode', this.isDarkMode);

      // Save preference to localStorage
      localStorage.setItem('musicmatch-darkmode', this.isDarkMode ? '1' : '0');

      // Notify user
      this.$q.notify({
        message: this.isDarkMode ? 'Switched to dark mode' : 'Switched to light mode',
        color: this.isDarkMode ? 'deep-purple-8' : 'deep-purple-6',
        textColor: 'white',
        position: 'bottom',
        timeout: 1500,
        icon: this.isDarkMode ? 'nights_stay' : 'wb_sunny',
        classes: 'toast-notification',
        html: true,
        caption: this.isDarkMode ? 'Perfect for late-night swiping 🌙' : 'Bright and beautiful ☀️'
      });
    }
  },
  mounted() {
    // Check localStorage for dark mode preference and apply it immediately
    const savedDark = localStorage.getItem('musicmatch-darkmode');
    this.isDarkMode = savedDark === '1';

    // Apply dark mode to both document elements
    document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    socket.emit('user_connected', this.currentUser.id);

    // Listen for mutual-match events
    if (socket) {
      socket.off('mutualMatch'); // Prevent duplicate listeners
      socket.on('mutualMatch', (data) => {
        // Defensive: only show popup if not already open
          this.matchedUser = data.user;
          this.sharedMusic = data.sharedMusic || { artists: [], genres: [] };
          this.showMatchPopup = true;
          console.log('🔔 MatchPopup opened for match:', data);
        
      });
    }

    this.fetchCurrentUser();
    if (this.user && this.user.id && socket) {
      socket.emit('register', this.user.id);
      console.log('📡 Socket registriert für User:', this.user.id);

      socket.on('matchNotification', data => {
        this.$q.notify({
          color: 'positive',
          message: data.message + ' mit ' + data.matchedWith,
          position: 'top',
        });
        console.log('🔔 Echtzeit-Match erhalten:', data);
      });
    } else {
      console.warn('⚠️ Socket oder User nicht vorhanden.');
    }
    this.fetchAllUsers();
    this.pollingInterval = setInterval(this.fetchAllUsers, 5000);


  },
  beforeUnmount() {
    clearInterval(this.pollingInterval);
  },
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
  background: linear-gradient(135deg, #f5f7fa 0%, #ede9fe 100%);
  min-height: 100vh;
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
  position: relative;
  z-index: 10;
}

.back-button {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #6d28d9;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  z-index: 1000;
}

.back-button:hover {
  background-color: #6d28d9;
  color: white;
  transform: translateY(-2px);
}

.card-stack {
  position: relative;
  width: 100%;
  max-width: 380px;
  height: 650px;
  margin-bottom: 20px;
  margin-top: 60px;
  z-index: 15;
}

.swipe-card {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease, opacity 0.2s ease;
  will-change: transform;
}

.swipe-card.active {
  z-index: 10;
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
  height: 40%;
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

/* Custom notification styling */
.q-notification {
  border-radius: 16px !important;
  backdrop-filter: blur(12px) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.notification-custom {
  background: linear-gradient(135deg, #6d28d9, #a78bfa) !important;
  animation: slideInRight 0.3s ease-out !important;
}

.dark-mode .notification-custom {
  background: linear-gradient(135deg, #312e81, #6d28d9) !important;
  box-shadow: 0 8px 32px rgba(109, 40, 217, 0.4) !important;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
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

.music-match-section {
  background-color: #f7f2ff;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 8px;
}

.music-match-header {
  display: flex;
  align-items: center;
  gap: 8px;
}


.music-match-header h3 {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #6d28d9;
}

.match-percentage {
  font-weight: 700;
  font-size: 18px;
  color: #6d28d9;
}

.album-cover {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  margin-right: 10px;
}

.music-section {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.section-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #444;
}

.section-header svg {
  color: #6d28d9;
}

.artists-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.artist-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: white;
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.artist-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #6d28d9;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.artist-name {
  font-size: 12px;
  font-weight: 500;
}

.genres-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.genre-chip {
  background-color: white;
  color: #6d28d9;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tracks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.album-cover {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.track-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.track-timing {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.track-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.track-artist {
  font-size: 13px;
  color: #555;
}

.play-button {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #6d28d9;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.social-section {
  padding: 12px;
  border-radius: 12px;
  background-color: #f0f7ff;
  margin-bottom: 4px;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.social-link {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.social-link.instagram {
  background-color: #e1306c;
  color: white;
}

.social-link.spotify {
  background-color: #1DB954;
  color: white;
}

.social-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.swipe-card.swipe-left {
  transform: translateX(-150%) rotate(-20deg) !important;
  opacity: 0;
}

.swipe-card.swipe-right {
  transform: translateX(150%) rotate(20deg) !important;
  opacity: 0;
}

.swipe-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.swipe-left-overlay {
  background-color: rgba(255, 92, 92, 0.2);
  border: 3px solid #ff5c5c;
}

.swipe-right-overlay {
  background-color: rgba(71, 189, 105, 0.2);
  border: 3px solid #47bd69;
}

.swipe-indicator {
  font-size: 32px;
  font-weight: 800;
  padding: 10px 20px;
  border-radius: 8px;
  transform: rotate(-20deg);
  letter-spacing: 1px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.swipe-left-overlay .swipe-indicator {
  background-color: #ff5c5c;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.swipe-right-overlay .swipe-indicator {
  background-color: #47bd69;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 36px;
  margin-top: 32px;
  margin-bottom: 32px;
  z-index: 10;
  position: relative;
  left: 0;
  right: 0;
  pointer-events: auto;
}

.action-button {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: linear-gradient(135deg, #ede9fe 60%, #c4b5fd 100%);
  box-shadow: 0 8px 32px 0 #a78bfa33, 0 2px 8px #c4b5fd22;
  transition: all 0.18s cubic-bezier(.4, 0, .2, 1);
  position: relative;
  outline: none;
  border: 2px solid #ede9fe;
}

.action-button.reject {
  background: linear-gradient(135deg, #fff1f2 60%, #f472b6 100%);
  border: 2px solid #f472b6;
}

.action-button.reject svg {
  color: #f472b6;
  width: 32px;
  height: 32px;
}

.action-button.like {
  background: linear-gradient(135deg, #ede9fe 60%, #a78bfa 100%);
  border: 2px solid #a78bfa;
}

.action-button.like svg {
  color: #7c3aed;
  width: 32px;
  height: 32px;
}

.action-button:after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 0 0 #a78bfa44;
  transition: box-shadow 0.2s;
  pointer-events: none;
}

.action-button:active:after,
.action-button:focus:after {
  box-shadow: 0 0 0 8px #a78bfa22;
}

.action-button:hover {
  transform: translateY(-6px) scale(1.06);
  box-shadow: 0 16px 48px 0 #a78bfa44, 0 4px 16px #c4b5fd33;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.empty-state h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.go-to-dashboard {
  background-color: #6d28d9;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.go-to-dashboard:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(109, 40, 217, 0.3);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #6d28d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.error-container {
  background-color: #ffe5e5;
  padding: 20px;
  border-radius: 12px;
  margin: 20px;
  border: 1px solid #ff8080;
  color: #cc0000;
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .card-stack {
    max-width: 340px;
    height: 600px;
  }

  .user-name {
    font-size: 24px;
  }

  .user-age {
    font-size: 20px;
  }

  .action-button {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {
  .card-stack {
    max-width: 300px;
    height: 550px;
    margin-top: 40px;
  }

  .back-button {
    top: 12px;
    left: 12px;
    padding: 6px 12px;
    font-size: 12px;
  }

  .card-image {
    height: 35%;
  }

  .card-content {
    padding: 16px;
    gap: 12px;
  }

  .user-name {
    font-size: 22px;
  }

  .user-age {
    font-size: 18px;
  }

  .music-section,
  .music-match-section {
    padding: 10px;
  }

  .action-button {
    width: 50px;
    height: 50px;
  }

  .action-button svg {
    width: 24px;
    height: 24px;
  }

  .swipe-indicator {
    font-size: 28px;
    padding: 8px 16px;
  }
}

.card-inner {
  animation: fadeIn 0.3s ease-out;
}

.music-section {
  animation: slideUp 0.3s ease-out;
}

.card-content::-webkit-scrollbar {
  width: 6px;
}

.card-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.card-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.action-button:focus,
.back-button:focus,
.expand-button:focus,
.play-button:focus,
.social-link:focus,
.go-to-dashboard:focus {
  outline: 2px solid #6d28d9;
  outline-offset: 2px;
}

@media (hover: none) {
  .action-button {
    transition: transform 0.1s ease;
  }

  .action-button:active {
    transform: scale(0.95);
  }
}

.currently-playing {
  background-color: #f0fff4;
  border-left: 3px solid #10b981;
}

.current-track {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
}

.playing-animation {
  display: flex;
  align-items: flex-end;
  height: 24px;
  gap: 2px;
}

.playing-animation span {
  display: block;
  width: 3px;
  background-color: #10b981;
  border-radius: 3px;
  animation: soundBars 1.5s infinite ease-in-out;
}

.playing-animation span:nth-child(1) {
  height: 8px;
  animation-delay: 0.2s;
}

.playing-animation span:nth-child(2) {
  height: 16px;
  animation-delay: 0.6s;
}

.playing-animation span:nth-child(3) {
  height: 12px;
  animation-delay: 0.3s;
}

.current-track-info {
  flex: 1;
}

.current-track-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.current-track-artist {
  font-size: 12px;
  color: #666;
}

@keyframes soundBars {

  0%,
  100% {
    height: 6px;
  }

  50% {
    height: 18px;
  }
}

.recently-played {
  background-color: #f5f0ff;
  border-left: 3px solid #8b5cf6;
}

.recent-tracks-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.track-timing {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6b7280;
  min-width: 80px;
}








@keyframes bgFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}




.darkmode-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: background 0.2s;
}

.darkmode-toggle:hover {
  background: #ede9fe;
}

.darkmode-toggle svg {
  color: #6d28d9;
  width: 26px;
  height: 26px;
  transition: color 0.2s;
}

.dark-mode .darkmode-toggle {
  background: #232136;
}

.dark-mode .darkmode-toggle svg {
  color: #c4b5fd;
}

.dark-mode,
.swipe-container.dark-mode {
  background: linear-gradient(135deg, #181825 0%, #312e81 100%) !important;
  color: #e0e7ff !important;
}



.dark-mode .track-title {
  color: #fef3c7 !important;
  /* Light yellow for high contrast */
  font-weight: 700;
}

.dark-mode .track-artist {
  color: #e0e7ff !important;
  /* Light blue/white for contrast */
}

/* ENHANCED DARK MODE FOR BACKGROUND ELEMENTS - DISTINCT COLORS */





/* Fix for SVG glow effects in dark mode to prevent square artifacts */


/* Apply proper glow to individual elements using box-shadow and proper filter techniques */















/* Make sure vinyl elements look circular and have proper glow */

/* Override any other settings that might cause square artifacts */



/* If needed: make note1 especially glow */








/* Bottom waves - enhanced visibility */
/* Enhanced Dark Mode Styling */
.dark-mode .card-inner {
  background: linear-gradient(145deg, #232136, #2a273f) !important;
  box-shadow: 0 20px 40px rgba(26, 24, 58, 0.6),
    0 0 0 1px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
  border-radius: 26px !important;
}

.dark-mode .card-image {
  box-shadow: inset 0 -10px 20px rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

.dark-mode .card-content {
  background: linear-gradient(to bottom, #232136, #1d1b2e) !important;
  scrollbar-color: #6d28d9 #312e81;
}

.dark-mode .card-content::-webkit-scrollbar-track {
  background: #312e81;
}

.dark-mode .card-content::-webkit-scrollbar-thumb {
  background: #6d28d9;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.4);
}

.dark-mode .user-header {
  border-bottom: 1px solid rgba(139, 92, 246, 0.15);
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.dark-mode .user-name {
  color: #f0f9ff !important;
  text-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
}

.dark-mode .user-age {
  color: #c4b5fd !important;
}

.dark-mode .user-bio {
  color: #cbd5e1 !important;
}

.dark-mode .music-match-section {
  background: linear-gradient(120deg, #312e81, #4c1d95) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.dark-mode .music-section {
  background: linear-gradient(to right, #1e1b4b, #312e81) !important;
  border-left: 3px solid #8b5cf6 !important;
  border-radius: 14px !important;
  box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.25) !important;
}

.dark-mode .section-header h3 {
  color: #fef3c7 !important;
  text-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
  letter-spacing: 0.5px;
}

.dark-mode .match-percentage {
  color: #fef3c7 !important;
  font-weight: 800;
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.dark-mode .artist-item,
.dark-mode .track-item {
  background: linear-gradient(145deg, #2a273f, #232136) !important;
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(139, 92, 246, 0.1) !important;
}

.dark-mode .artist-avatar {
  background: linear-gradient(145deg, #8b5cf6, #7c3aed) !important;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
}

.dark-mode .genre-chip {
  background: linear-gradient(145deg, #3730a3, #4338ca) !important;
  color: #fef3c7 !important;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(139, 92, 246, 0.2) !important;
  border-radius: 20px;
  padding: 5px 14px;
  transform: translateY(0);
  transition: all 0.2s ease;
}

.dark-mode .genre-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(139, 92, 246, 0.3) !important;
}

.dark-mode .match-badge {
  background: linear-gradient(120deg, #4c1d95, #6d28d9) !important;
  color: #fef3c7 !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.dark-mode .action-button {
  background: linear-gradient(135deg, #4c1d95, #6d28d9) !important;
  border: 2px solid #a78bfa !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(139, 92, 246, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
}

.dark-mode .action-button:hover {
  transform: translateY(-8px) scale(1.08);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.3),
    0 0 20px rgba(139, 92, 246, 0.4) !important;
}

.dark-mode .action-button.reject {
  background: linear-gradient(135deg, #9d174d, #db2777) !important;
  border: 2px solid #fb7185 !important;
}

.dark-mode .action-button.reject:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(251, 113, 133, 0.3),
    0 0 20px rgba(251, 113, 133, 0.4) !important;
}

.dark-mode .action-button.like {
  background: linear-gradient(135deg, #4f46e5, #6d28d9) !important;
  border: 2px solid #a78bfa !important;
}

.dark-mode .action-button.like:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(167, 139, 250, 0.3),
    0 0 20px rgba(167, 139, 250, 0.4) !important;
}

.dark-mode .action-button svg {
  color: #fef3c7 !important;
  filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
}

.dark-mode .currently-playing {
  background: linear-gradient(to right, #064e3b, #065f46) !important;
  border-left: 3px solid #10b981 !important;
}

.dark-mode .recently-played {
  background: linear-gradient(to right, #4c1d95, #5b21b6) !important;
  border-left: 3px solid #8b5cf6 !important;
}

.dark-mode .current-track,
.dark-mode .track-item {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dark-mode .playing-animation span {
  background-color: #10b981 !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
}

/* Enhanced glow effects for backgrounds in dark mode */


/* Enhanced glow when hovering over buttons in dark mode */
.dark-mode .back-button:hover,
.dark-mode .darkmode-toggle:hover {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5) !important;
}

/* Add this to the end of your stylesheet */
/* Fix container sizing and structure consistency between modes */
.swipe-container,
body.dark-mode .swipe-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding: 0 20px;
  position: relative;
  box-sizing: border-box;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Ensure card dimensions are identical in both modes */
.card-stack,
body.dark-mode .card-stack {
  position: relative;
  width: 100%;
  max-width: 380px;
  height: 650px;
  margin-bottom: 20px;
  margin-top: 60px;
}

/* Fix card structure (keep identical in both modes) */
.swipe-card,
body.dark-mode .swipe-card {
  position: absolute;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease, opacity 0.2s ease;
  will-change: transform;
}

.card-inner,
body.dark-mode .card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

/* Consistent button positioning */
.action-buttons,
body.dark-mode .action-buttons {
  display: flex;
  justify-content: center;
  gap: 36px;
  margin-top: 32px;
  margin-bottom: 32px;
  z-index: 10;
  position: relative;
}

/* Fix section layouts to be identical */
.card-image,
body.dark-mode .card-image {
  width: 100%;
  height: 40%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.card-content,
body.dark-mode .card-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Fix music sections to maintain consistent structure */
.music-section,
body.dark-mode .music-section,
.music-match-section,
body.dark-mode .music-match-section {
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 4px;
}

/* Consistent typography structure */
.user-header,
body.dark-mode .user-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.user-name,
body.dark-mode .user-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
}

.user-age,
body.dark-mode .user-age {
  font-size: 24px;
  font-weight: 500;
}

/* Ensure background animations appear the same structurally */

/* Consistent responsive behavior */
@media (max-width: 768px) {

  .card-stack,
  body.dark-mode .card-stack {
    max-width: 340px;
    height: 600px;
  }

  .action-button,
  body.dark-mode .action-button {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 480px) {

  .card-stack,
  body.dark-mode .card-stack {
    max-width: 300px;
    height: 550px;
    margin-top: 40px;
  }

  .card-image,
  body.dark-mode .card-image {
    height: 35%;
  }

  .card-content,
  body.dark-mode .card-content {
    padding: 16px;
    gap: 12px;
  }

  .action-button,
  body.dark-mode .action-button {
    width: 50px;
    height: 50px;
  }
}

/* Fix element transitions between modes */
.swipe-container,
.card-inner,
.card-content,
.music-section,
.genre-chip,
.artist-item,
.track-item,
.action-button,
.user-name,
.user-bio {
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, border 0.3s ease;
}

@media (max-width: 600px) {
  .swipe-container {
    padding: 0 4px;
    min-height: 100vh;
    height: auto;
  }


  .card-stack {
    max-width: 98vw;
    height: 70vh;
    margin-top: 24px;
    margin-bottom: 12px;
  } 
  .back-button {
     position: fixed;
     top: 12px;
     left: 12px;
     right: auto;
     z-index: 1100;
     margin: 0;
   }
  
   .darkmode-toggle {
     position: fixed;
     top: 60px;
     left: 12px;
     right: auto;
     z-index: 1100;
     margin: 0;
   }

  .swipe-card,
  .card-inner {
    border-radius: 14px;
  }

  .card-content {
    padding: 10px;
    gap: 8px;
    font-size: 15px;
  }

  .user-header {
    gap: 6px;
  }

  .user-name {
    font-size: 18px;
  }

  .user-age {
    font-size: 15px;
  }

  .music-section,
  .music-match-section {
    padding: 7px;
    border-radius: 8px;
  }

  .action-buttons {
    gap: 18px;
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .action-button {
    width: 44px;
    height: 44px;
  }

  .back-button,
  .darkmode-toggle {
    top: 8px;
    left: 8px;
    right: 8px;
    padding: 4px 8px;
    font-size: 12px;
    width: 36px;
    height: 36px;
  }

  .empty-state {
    padding: 16px;
  }

  .card-image {
    height: 32vw;
    min-height: 120px;
    max-height: 160px;
  }
}

@media (max-width: 400px) {
  .card-stack {
    max-width: 99vw;
    height: 60vh;
  }

  .card-content {
    font-size: 13px;
    padding: 6px;
  }

  .user-name {
    font-size: 15px;
  }

  .action-button {
    width: 36px;
    height: 36px;
  }
}

.chat-button {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  color: #6d28d9;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  z-index: 1000;
}

.chat-button:hover {
  background-color: #6d28d9;
  color: white;
  transform: translateX(-50%) translateY(-2px);
}

.dark-mode .chat-button {
  background: #232136;
}

.dark-mode .chat-button svg {
  color: #c4b5fd;
}

@media (max-width: 600px) {
  .chat-button {
    top: 60px;
    left: 12px;
    right: auto;
    transform: none;
    z-index: 1100;
    margin: 0;
  }
}
</style>
