<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

withDefaults(defineProps<{
  title?: string
  activeNav?: string
}>(), {
  title: '',
  activeNav: 'workspaces',
})
</script>

<template>
  <div class="layout">
    <AppSidebar :active-nav="activeNav" />
    <div class="main-panel">
      <AppHeader :title="title" />
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--surface-container-lowest);
}
</style>
