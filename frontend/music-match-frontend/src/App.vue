<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container :class="containerClass">
      <BGElements />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import BGElements from 'components/BGElements.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Determine which background to use based on route
const containerClass = computed(() => {
  const showMusicBg = ['/swipe', '/chats'].includes(route.path) || route.path.startsWith('/chat/');

  return {
    'music-background': showMusicBg,
    'default-background': !showMusicBg
  };
});
</script>

<style>
/* Default background for other pages */
.default-background {
  background: linear-gradient(135deg, #f5f7fa 0%, #c7d2fe 100%);
  min-height: 100vh;
  transition: background 0.3s ease;
}

/* Music-themed background for swipe/chat pages */
.music-background {
  background: linear-gradient(135deg, #f5f7fa 0%, #ede9fe 100%);
  min-height: 100vh;
  transition: background 0.3s ease;
}

/* Dark mode backgrounds */
body.dark-mode .default-background {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%) !important;
}

body.dark-mode .music-background {
  background: linear-gradient(135deg, #181825 0%, #312e81 100%) !important;
}
</style>