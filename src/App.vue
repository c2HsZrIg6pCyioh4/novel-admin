<template>
  <div class="app">
    <NavBar />
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue'
</script>

<style scoped>
.app { min-height: 100vh; background: #f6f7fb; }
.container { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
</style>
