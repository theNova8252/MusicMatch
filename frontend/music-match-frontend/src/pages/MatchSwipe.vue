<template>
  <div class="swipe-container" :class="{ 'dark-mode': isDarkMode }">
    <button class="back-button" @click="navigateToDashboard">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>Dashboard</span>
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
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
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
  <div class="vinyl-bg">
    <svg class="vinyl vinyl1" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#fff" stroke="#6d28d9" stroke-width="4" />
      <circle cx="30" cy="30" r="10" fill="#6d28d9" />
      <circle cx="30" cy="30" r="3" fill="#fff" />
    </svg>
    <svg class="vinyl vinyl2" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#fff" stroke="#8b5cf6" stroke-width="4" />
      <circle cx="30" cy="30" r="10" fill="#8b5cf6" />
      <circle cx="30" cy="30" r="3" fill="#fff" />
    </svg>
  </div>
  <div class="music-bokeh-bg">
    <div class="bokeh bokeh1"></div>
    <div class="bokeh bokeh2"></div>
    <div class="bokeh bokeh3"></div>
    <div class="bokeh bokeh4"></div>
    <div class="bokeh bokeh5"></div>
    <div class="bokeh bokeh6"></div>
  </div>
  <div class="music-shapes-bg">
    <svg class="music-shape note1" viewBox="0 0 32 32">
      <path d="M24 4v16.5a6 6 0 1 1-2-4.5V8h-8V20.5a6 6 0 1 1-2-4.5V4h12z" fill="#c4b5fd" opacity="0.7" />
    </svg>
    <svg class="music-shape star1" viewBox="0 0 32 32">
      <polygon points="16,3 19,13 29,13 21,19 24,29 16,23 8,29 11,19 3,13 13,13" fill="#a78bfa" opacity="0.5" />
    </svg>
    <svg class="music-shape wave1" viewBox="0 0 64 16">
      <path d="M0 8 Q8 0 16 8 T32 8 T48 8 T64 8" stroke="#ede9fe" stroke-width="2" fill="none" opacity="0.7" />
    </svg>
  </div>
  <div class="extra-bg-shapes">
    <svg class="shape vinyl3" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="#fff" stroke="#f472b6" stroke-width="4" />
      <circle cx="30" cy="30" r="10" fill="#f472b6" />
      <circle cx="30" cy="30" r="3" fill="#fff" />
    </svg>
    <svg class="shape note2" viewBox="0 0 32 32">
      <path d="M24 4v16.5a6 6 0 1 1-2-4.5V8h-8V20.5a6 6 0 1 1-2-4.5V4h12z" fill="#f472b6" opacity="0.5" />
    </svg>
    <svg class="shape star2" viewBox="0 0 32 32">
      <polygon points="16,3 19,13 29,13 21,19 24,29 16,23 8,29 11,19 3,13 13,13" fill="#fbbf24" opacity="0.4" />
    </svg>
    <svg class="shape sparkle1" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="2" fill="#fff" opacity="0.7" />
      <g stroke="#fbbf24" stroke-width="1.5" opacity="0.7">
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </g>
    </svg>
    <svg class="shape sparkle2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="1.2" fill="#fff" opacity="0.5" />
      <g stroke="#a78bfa" stroke-width="1" opacity="0.5">
        <line x1="12" y1="4" x2="12" y2="8" />
        <line x1="12" y1="16" x2="12" y2="20" />
        <line x1="4" y1="12" x2="8" y2="12" />
        <line x1="16" y1="12" x2="20" y2="12" />
      </g>
    </svg>
    <svg class="shape wave2" viewBox="0 0 64 16">
      <path d="M0 8 Q8 0 16 8 T32 8 T48 8 T64 8" stroke="#f472b6" stroke-width="2" fill="none" opacity="0.5" />
    </svg>
  </div>


  <div class="bottom-waves-bg">
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="wave-svg">
      <defs>
        <linearGradient id="prettyWaveGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ede9fe" stop-opacity="0.95" />
          <stop offset="60%" stop-color="#c4b5fd" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#a78bfa" stop-opacity="0.5" />
        </linearGradient>
      </defs>
      <path fill="url(#prettyWaveGradient)" fill-opacity="1" d="M0,80 C360,120 1080,40 1440,80 L1440,120 L0,120 Z" />
      <path fill="#c4b5fd" fill-opacity="0.35" d="M0,100 C480,60 960,140 1440,100 L1440,120 L0,120 Z" />
      <path fill="#a78bfa" fill-opacity="0.18" d="M0,110 C600,90 900,130 1440,110 L1440,120 L0,120 Z" />
    </svg>
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
      isDarkMode: false
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

      if (this.visibleUsers[this.activeCardIndex]) {
        const userId = this.visibleUsers[this.activeCardIndex].id;
        this.seenUserIds.add(userId);
        this.visibleUsers[this.activeCardIndex].direction = 'right';
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
          const matched = this.visibleUsers.find(u => u.id === userId);

          if (!matched) {
            console.error('❌ No matched user found at current index');
            return;
          }

          this.currentUser = this.getProcessedCurrentUser();
          console.log("✅ currentUser:", this.currentUser);

          this.matchedUser = {
            ...matched,
            profileImage: this.getFullImageUrl(matched.profileImage)
          };

          this.sharedMusic = this.getSharedMusic(this.currentUser, matched);
          this.showMatchPopup = true;
        }
      } catch (err) {
        console.error('Failed to like user:', err);
      }
    },
    getSharedMusic(currentUser, matchedUser) {
      const sharedArtists = currentUser.favoriteArtists?.filter(artist =>
        matchedUser.favoriteArtists?.includes(artist)
      ) || [];

      const sharedGenres = currentUser.favoriteGenres?.filter(genre =>
        matchedUser.favoriteGenres?.includes(genre)
      ) || [];

      return { artists: sharedArtists, genres: sharedGenres };
    },
    closeMatchPopup() {
      this.showMatchPopup = false;
      this.matchedUser = null;
    },
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      document.documentElement.classList.toggle('dark-mode', this.isDarkMode);
    },
  },
  mounted() {
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

    this.socket = new WebSocket('ws://localhost:5000');
    this.socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'mutualMatch') {
          console.log('Mutual match detected:', data);
          this.matchedUser = data.user;
          this.showMatchPopup = true;
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });
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

@keyframes vinyl-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes vinyl-float {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-32px);
  }
}

.music-bokeh-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  animation: bgFadeIn 0.7s both;
}

.bokeh {
  position: absolute;
  border-radius: 50%;
  opacity: 0.32;
  filter: blur(24px) brightness(1.1);
  animation: bokeh-float 18s infinite alternate ease-in-out;
  mix-blend-mode: lighten;
  transition: opacity 0.4s, filter 0.4s;
  animation-fill-mode: both;
  will-change: transform, opacity;
}

.bokeh1 {
  width: 240px;
  height: 240px;
  background: #a78bfa;
  top: 12vh;
  left: 8vw;
  animation-delay: 0s;
}

.bokeh2 {
  width: 160px;
  height: 160px;
  background: #c4b5fd;
  top: 60vh;
  left: 70vw;
  animation-delay: 3s;
}

.bokeh3 {
  width: 200px;
  height: 200px;
  background: #ede9fe;
  top: 35vh;
  left: 45vw;
  animation-delay: 7s;
}

.bokeh4 {
  width: 120px;
  height: 120px;
  background: #a5b4fc;
  top: 25vh;
  left: 18vw;
  animation-delay: 9s;
}

.bokeh5 {
  width: 180px;
  height: 180px;
  background: #f3e8ff;
  top: 55vh;
  left: 80vw;
  animation-delay: 12s;
}

.bokeh6 {
  width: 260px;
  height: 260px;
  background: #e0e7ff;
  top: 5vh;
  left: 60vw;
  animation-delay: 15s;
}

@keyframes bokeh-float {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
  }

  50% {
    transform: translateY(-32px) scale(1.08) rotate(8deg);
  }

  100% {
    transform: translateY(-64px) scale(1.13) rotate(-8deg);
  }
}

@keyframes bgFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.vinyl-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
  animation: bgFadeIn 0.7s both;
}

.vinyl {
  position: absolute;
  opacity: 0.18;
  animation: vinyl-spin 16s linear infinite, vinyl-float 10s infinite alternate;
  filter: drop-shadow(0 4px 24px #a78bfa44);
  animation-fill-mode: both;
  will-change: transform, opacity;
}

.vinyl1 {
  top: 8vh;
  left: 6vw;
  width: 140px;
  height: 140px;
  animation-duration: 22s;
}

.vinyl2 {
  bottom: 10vh;
  right: 10vw;
  width: 100px;
  height: 100px;
  animation-duration: 16s;
}

.vinyl3 {
  left: 80vw;
  top: 12vh;
  width: 110px;
  height: 110px;
  opacity: 0.11;
  animation-delay: 2s;
}

@keyframes vinyl-spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes vinyl-float {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-32px);
  }
}

.music-shapes-bg,
.extra-bg-shapes {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
  animation: bgFadeIn 0.7s both;
}

.music-shape,
.shape {
  position: absolute;
  opacity: 0.38;
  filter: blur(0.2px);
  animation: float-shape 14s infinite alternate ease-in-out;
  animation-fill-mode: both;
  will-change: transform, opacity;
}

.note1 {
  left: 14vw;
  top: 32vh;
  width: 54px;
  height: 54px;
  animation-delay: 0s;
}

.star1 {
  left: 82vw;
  top: 62vh;
  width: 38px;
  height: 38px;
  animation-delay: 3s;
}

.wave1 {
  left: 52vw;
  top: 14vh;
  width: 120px;
  height: 32px;
  animation-delay: 6s;
}

.note2 {
  left: 22vw;
  top: 72vh;
  width: 40px;
  height: 40px;
  animation-delay: 4s;
}

.star2 {
  left: 62vw;
  top: 27vh;
  width: 34px;
  height: 34px;
  animation-delay: 7s;
}

.wave2 {
  left: 12vw;
  top: 82vh;
  width: 90px;
  height: 24px;
  animation-delay: 9s;
}

@keyframes float-shape {
  0% {
    transform: translateY(0) scale(1) rotate(0deg);
  }

  50% {
    transform: translateY(-36px) scale(1.12) rotate(10deg);
  }

  100% {
    transform: translateY(-70px) scale(1.07) rotate(-8deg);
  }
}

.sparkle1,
.sparkle2 {
  opacity: 0.7;
  animation: sparkle 2.2s infinite alternate;
  animation-fill-mode: both;
  will-change: transform, opacity;
}

.sparkle1 {
  left: 38vw;
  top: 18vh;
  width: 28px;
  height: 28px;
  animation: sparkle 2.5s infinite alternate;
}

.sparkle2 {
  left: 78vw;
  top: 82vh;
  width: 18px;
  height: 18px;
  animation: sparkle 3.2s infinite alternate;
}

@keyframes sparkle {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.18) rotate(10deg);
  }
}

.bottom-waves-bg {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 180px;
  z-index: 4;
  pointer-events: none;
  overflow: hidden;
  animation: bgFadeIn 0.7s both;
  background: none;
}

.wave-svg {
  width: 100vw;
  height: 180px;
  display: block;
  filter: blur(2.5px) brightness(1.08) drop-shadow(0 12px 48px #a78bfa88) drop-shadow(0 0px 32px #c4b5fd55);
  animation: waveParallax 8s cubic-bezier(.4, 0, .2, 1) infinite alternate;
  animation-fill-mode: both;
  will-change: transform;
  opacity: 1;
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0.7) 60%, rgba(0, 0, 0, 0.01) 100%);
}

.wave-svg path:nth-child(1) {
  fill: url(#prettyWaveGradient);
  opacity: 0.92;
  filter: drop-shadow(0 8px 32px #a78bfa55) blur(1px);
}

.wave-svg path:nth-child(2) {
  fill: #c4b5fd;
  opacity: 0.22;
  filter: blur(2px);
}

.wave-svg path:nth-child(3) {
  fill: #a78bfa;
  opacity: 0.13;
  filter: blur(3px);
}

@keyframes waveParallax {
  0% {
    transform: translateY(0) scaleX(1);
  }

  100% {
    transform: translateY(-18px) scaleX(1.04);
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

/* ENHANCED DARK MODE FOR BACKGROUND ELEMENTS */
.dark-mode .music-bokeh-bg,
.dark-mode .vinyl-bg,
.dark-mode .music-shapes-bg,
.dark-mode .extra-bg-shapes,
.dark-mode .bottom-waves-bg {
  opacity: 1 !important;
  z-index: 5 !important;
  filter: none !important;
  visibility: visible !important;
  display: block !important;
}

/* Bokeh elements - bigger, brighter, more visible */
.dark-mode .bokeh {
  opacity: 0.8 !important;
  filter: blur(20px) brightness(1.5) !important;
  mix-blend-mode: screen !important;
  transform-origin: center !important;
  animation-duration: 28s !important;
}

.dark-mode .bokeh1 {
  background: #9333ea !important;
  width: 350px !important;
  height: 350px !important;
  box-shadow: 0 0 60px #9333eacc !important;
}

.dark-mode .bokeh2 {
  background: #4f46e5 !important;
  width: 280px !important;
  height: 280px !important;
  box-shadow: 0 0 50px #4f46e5cc !important;
}

.dark-mode .bokeh3 {
  background: #6d28d9 !important;
  width: 320px !important;
  height: 320px !important;
  box-shadow: 0 0 55px #6d28d9cc !important;
}

.dark-mode .bokeh4 {
  background: #8b5cf6 !important;
  width: 250px !important;
  height: 250px !important;
  box-shadow: 0 0 45px #8b5cf6cc !important;
}

.dark-mode .bokeh5 {
  background: #c084fc !important;
  width: 300px !important;
  height: 300px !important;
  box-shadow: 0 0 55px #c084fccc !important;
}

.dark-mode .bokeh6 {
  background: #a855f7 !important;
  width: 330px !important;
  height: 330px !important;
  box-shadow: 0 0 50px #a855f7cc !important;
}

/* Vinyl records - more visible with glow effects */
.dark-mode .vinyl {
  opacity: 0.85 !important;
  filter: none !important;
  mix-blend-mode: screen !important;
}

.dark-mode .vinyl1 circle:first-child {
  fill: #1e1b4b !important;
  stroke: #c084fc !important;
  stroke-width: 4 !important;
  filter: drop-shadow(0 0 15px #c084fc) !important;
}

.dark-mode .vinyl2 circle:first-child {
  fill: #312e81 !important;
  stroke: #8b5cf6 !important;
  stroke-width: 4 !important;
  filter: drop-shadow(0 0 15px #8b5cf6) !important;
}

.dark-mode .vinyl3 circle:first-child {
  fill: #4c1d95 !important;
  stroke: #f472b6 !important;
  stroke-width: 4 !important;
  filter: drop-shadow(0 0 15px #f472b6) !important;
}

.dark-mode .vinyl1 circle:nth-child(2),
.dark-mode .vinyl2 circle:nth-child(2),
.dark-mode .vinyl3 circle:nth-child(2) {
  fill: rgba(139, 92, 246, 0.8) !important;
}

.dark-mode .vinyl1 circle:last-child,
.dark-mode .vinyl2 circle:last-child,
.dark-mode .vinyl3 circle:last-child {
  fill: #f9fafb !important;
}

/* Music shapes - vibrant colors with glow effects */
.dark-mode .music-shape,
.dark-mode .shape {
  opacity: 0.85 !important;
  filter: none !important;
  mix-blend-mode: screen !important;
}

.dark-mode .music-shape.note1 path {
  fill: #c084fc !important;
  filter: drop-shadow(0 0 10px #c084fc) !important;
}

.dark-mode .music-shape.star1 polygon {
  fill: #60a5fa !important;
  filter: drop-shadow(0 0 10px #60a5fa) !important;
}

.dark-mode .music-shape.wave1 path {
  stroke: #f0f9ff !important;
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 10px #f0f9ff) !important;
}

.dark-mode .shape.note2 path {
  fill: #fb7185 !important;
  filter: drop-shadow(0 0 10px #fb7185) !important;
}

.dark-mode .shape.star2 polygon {
  fill: #fcd34d !important;
  filter: drop-shadow(0 0 10px #fcd34d) !important;
}

.dark-mode .shape.wave2 path {
  stroke: #fb7185 !important;
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 10px #fb7185) !important;
}

/* Sparkles - brighter with animation */
.dark-mode .sparkle1 circle,
.dark-mode .sparkle2 circle {
  fill: #f9fafb !important;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.9)) !important;
}

.dark-mode .sparkle1 g,
.dark-mode .sparkle2 g {
  stroke: #fcd34d !important;
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 5px #fcd34d) !important;
}

.dark-mode .sparkle1 {
  animation: dark-sparkle 3s infinite alternate !important;
}

.dark-mode .sparkle2 {
  animation: dark-sparkle 4s infinite alternate-reverse !important;
}

@keyframes dark-sparkle {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.3) rotate(20deg);
    filter: drop-shadow(0 0 15px white);
  }
}

/* Bottom waves - enhanced visibility */
.dark-mode .wave-svg {
  opacity: 1 !important;
  filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4)) !important;
}

.dark-mode #prettyWaveGradient stop:first-child {
  stop-color: #8b5cf6 !important;
  stop-opacity: 0.9 !important;
}

.dark-mode #prettyWaveGradient stop:nth-child(2) {
  stop-color: #7c3aed !important;
  stop-opacity: 0.7 !important;
}

.dark-mode #prettyWaveGradient stop:last-child {
  stop-color: #6d28d9 !important;
  stop-opacity: 0.5 !important;
}

.dark-mode .wave-svg path:nth-child(2) {
  fill: #6366f1 !important;
  opacity: 0.4 !important;
}

.dark-mode .wave-svg path:nth-child(3) {
  fill: #a78bfa !important;
  opacity: 0.3 !important;
}
</style>
