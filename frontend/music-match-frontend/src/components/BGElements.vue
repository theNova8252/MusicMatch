<template>
  <!-- Global Background Elements -->
  <div class="global-bg-container" v-show="shouldShow">
    <div class="vinyl-bg">
      <svg class="vinyl vinyl1" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="28" class="vinyl-outer" />
        <circle cx="30" cy="30" r="10" class="vinyl-outer" />
        <circle cx="30" cy="30" r="3" class="vinyl-outer" />
      </svg>
      <svg class="vinyl vinyl2" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="28" class="vinyl-outer" />
        <circle cx="30" cy="30" r="10" class="vinyl-outer" />
        <circle cx="30" cy="30" r="3" class="vinyl-outer" />
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
  </div>
</template>

<script>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'BGElements',
  setup() {
    const route = useRoute()

    const shouldShow = computed(() => {
      const currentPath = route.path || ''
      const currentName = route.name || ''

      console.log('BGElements - Current path:', currentPath)
      console.log('BGElements - Current route name:', currentName)

      // More comprehensive route matching
      const showOnPaths = ['/swipe', '/chats']
      const showOnNames = ['ChatList', 'ChatPage', 'MatchSwipe', 'SwipeCards']

      const shouldShowBg =
        showOnPaths.includes(currentPath) ||
        showOnNames.includes(currentName) ||
        currentPath.startsWith('/chat/') ||
        currentPath.includes('swipe') ||
        currentPath.includes('chat')

      console.log('BGElements - Should show:', shouldShowBg)
      return shouldShowBg
    })

    onMounted(() => {
      console.log('BGElements mounted')
      console.log('Route details:', {
        path: route.path,
        name: route.name,
        fullPath: route.fullPath
      })
    })

    watch(() => route.path, (newPath, oldPath) => {
      console.log(`Route changed from ${oldPath} to ${newPath}`)
      console.log('Should show now:', shouldShow.value)
    }, { immediate: true })

    return {
      shouldShow
    }
  }
}
</script>

<style scoped>
.global-bg-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
  transition: opacity 0.3s ease;
  opacity: 1;
  visibility: visible;
}

/* Force visibility for all background layers */
.music-bokeh-bg,
.vinyl-bg,
.music-shapes-bg,
.extra-bg-shapes,
.bottom-waves-bg {
  visibility: visible !important;
  display: block !important;
  opacity: 1 !important;
  z-index: inherit !important;
}

.music-bokeh-bg {
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
  z-index: 3;
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
  left: 75vw;
  top: 15vh;
  width: 80px !important;
  height: 80px !important;
  animation-delay: 2s;
  opacity: 0.15 !important;
}
.shape {
  position: absolute;
  opacity: 0.38;
  filter: blur(0.2px);
  animation: float-shape 14s infinite alternate ease-in-out;
  animation-fill-mode: both;
  will-change: transform, opacity;
  max-width: 120px !important;
  max-height: 120px !important;
}
.shape.vinyl3 {
  width: 80px !important;
  height: 80px !important;
  max-width: 80px !important;
  max-height: 80px !important;
  opacity: 0.15 !important;
}

.shape.vinyl3 circle {
  max-width: 100% !important;
  max-height: 100% !important;
}

/* Dark mode vinyl3 styling */
body.dark-mode .shape.vinyl3 circle:first-child {
  fill: #312e81 !important;
  stroke: #fb7185 !important;
  stroke-width: 2 !important;
}

body.dark-mode .shape.vinyl3 circle:nth-child(2) {
  fill: #fb7185 !important;
}

body.dark-mode .shape.vinyl3 circle:last-child {
  fill: #312e81 !important;
}
.vinyl-outer {
  fill: #fff;
  stroke: #6d28d9;
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
  z-index: 4;
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
  z-index: 5;
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

@keyframes waveParallax {
  0% {
    transform: translateY(0) scaleX(1);
  }

  100% {
    transform: translateY(-18px) scaleX(1.04);
  }
}

/* Dark mode styles with negative z-index */
body.dark-mode .global-bg-container {
  z-index: 1 !important;
}

body.dark-mode .music-bokeh-bg {
  z-index: 2 !important;
}

body.dark-mode .vinyl-bg {
  z-index: 3 !important;
}

body.dark-mode .music-shapes-bg,
body.dark-mode .extra-bg-shapes {
  z-index: 4 !important;
}

body.dark-mode .bottom-waves-bg {
  z-index: 5 !important;
}

/* Light mode default styles - ensure they work */
body:not(.dark-mode) .vinyl-outer {
  fill: #fff;
  stroke: #6d28d9;
}

body:not(.dark-mode) .bokeh {
  opacity: 0.32 !important;
  filter: blur(24px) brightness(1.1) !important;
  mix-blend-mode: lighten !important;
}

/* Enhanced Dark mode styles */
body.dark-mode .global-bg-container {
  opacity: 1 !important;
  visibility: visible !important;
}

body.dark-mode .vinyl-outer {
  fill: #312e81 !important;
  stroke: #c084fc !important;
}

body.dark-mode .bokeh {
  opacity: 0.25 !important;
  filter: blur(32px) brightness(1.8) !important;
  mix-blend-mode: lighten !important;
}

body.dark-mode .bokeh1 {
  background: #9333ea !important;
  box-shadow: 0 0 60px #9333ea99 !important;
}

body.dark-mode .bokeh2 {
  background: #4f46e5 !important;
  box-shadow: 0 0 50px #4f46e599 !important;
}

body.dark-mode .bokeh3 {
  background: #6d28d9 !important;
  box-shadow: 0 0 55px #6d28d999 !important;
}

body.dark-mode .bokeh4 {
  background: #8b5cf6 !important;
  box-shadow: 0 0 45px #8b5cf699 !important;
}

body.dark-mode .bokeh5 {
  background: #f472b6 !important;
  box-shadow: 0 0 55px #f472b699 !important;
}

body.dark-mode .bokeh6 {
  background: #fbbf24 !important;
  box-shadow: 0 0 50px #fbbf2499 !important;
}

body.dark-mode .music-shape.note1 path {
  fill: #c084fc !important;
  filter: drop-shadow(0 0 10px #c084fc) !important;
  opacity: 0.8 !important;
}

body.dark-mode .music-shape.star1 polygon {
  fill: #60a5fa !important;
  filter: drop-shadow(0 0 10px #60a5fa) !important;
  opacity: 0.7 !important;
}

body.dark-mode .music-shape.wave1 path {
  stroke: #f0f9ff !important;
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 10px #f0f9ff) !important;
  opacity: 0.8 !important;
}

body.dark-mode .shape.note2 path {
  fill: #fb7185 !important;
  filter: drop-shadow(0 0 10px #fb7185) !important;
  opacity: 0.7 !important;
}

body.dark-mode .shape.star2 polygon {
  fill: #fcd34d !important;
  filter: drop-shadow(0 0 10px #fcd34d) !important;
  opacity: 0.6 !important;
}

body.dark-mode .shape.wave2 path {
  stroke: #fb7185 !important;
  stroke-width: 3px !important;
  filter: drop-shadow(0 0 10px #fb7185) !important;
  opacity: 0.7 !important;
}

body.dark-mode .sparkle1 circle,
body.dark-mode .sparkle2 circle {
  fill: #f9fafb !important;
  filter: drop-shadow(0 0 8px #fff9) !important;
}

body.dark-mode .sparkle1 g,
body.dark-mode .sparkle2 g {
  stroke: #fcd34d !important;
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 5px #fcd34d) !important;
  opacity: 0.9 !important;
}

body.dark-mode .vinyl {
  opacity: 0.35 !important;
  filter: drop-shadow(0 0 25px rgba(139, 92, 246, 0.6)) brightness(1.2) !important;
}

body.dark-mode .note1 {
  animation: pulseNote 4s infinite ease-in-out !important;
}

@keyframes pulseNote {

  0%,
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 8px #c084fc88);
  }

  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 18px #c084fcaa);
  }
}

body.dark-mode .sparkle1,
body.dark-mode .sparkle2 {
  animation: dark-sparkle 4s infinite ease-in-out !important;
  opacity: 1 !important;
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

/* Enhanced wave styling for dark mode */
body.dark-mode .wave-svg {
  filter: blur(2.5px) brightness(1.3) drop-shadow(0 12px 48px #9333ea88) drop-shadow(0 0px 32px #c084fc55) !important;
  opacity: 0.9 !important;
}

body.dark-mode .bottom-waves-bg defs stop {
  stop-color: #312e81 !important;
}

body.dark-mode .bottom-waves-bg path:first-of-type {
  fill: #312e81 !important;
  fill-opacity: 0.6 !important;
}

body.dark-mode .bottom-waves-bg path:nth-of-type(2) {
  fill: #8b5cf6 !important;
  fill-opacity: 0.4 !important;
}

body.dark-mode .bottom-waves-bg path:nth-of-type(3) {
  fill: #c084fc !important;
  fill-opacity: 0.3 !important;
}
</style>