<template>
  <q-page>
    <h1>Find Your Music Match</h1>
    <div v-if="matches.length">
      <q-card v-for="match in matches" :key="match.id" class="q-mb-md">
        <q-card-section>
          <h3>{{ match.name }}</h3>
          <p>Top Artist: {{ match.topArtist }}</p>
        </q-card-section>
      </q-card>
    </div>
    <p v-else>No matches found yet. Keep swiping!</p>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios';

const matches = ref([]);

async function fetchMatches() {
  const res = await api.get('/api/match');
  matches.value = res.data;
}

onMounted(fetchMatches);
</script>