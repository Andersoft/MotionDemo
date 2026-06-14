<script setup lang="ts">
import { ref } from 'vue'
import AppInput from './AppInput.vue'
import AppButton from './AppButton.vue'

const searchQuery = ref('')
</script>

<template>
  <header class="header">
    <div class="header-left">
      <div class="title-area">
        <span class="material-symbols-outlined icon">description</span>
        <span class="title">Workspace Editor</span>
      </div>
      <div class="divider"></div>
      <AppInput v-model="searchQuery" icon="search" placeholder="Search page..." />
    </div>
    <div class="header-right">
      <AppButton variant="ghost" icon="share" />
      <AppButton variant="ghost" icon="history" />
      <AppButton variant="ghost" icon="more_vert" />
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-gutter);
  height: 56px;
  width: 100%;
  border-bottom: 1px solid var(--outline-variant);
  background-color: var(--surface);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.title-area {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.icon {
  color: var(--on-surface-variant);
}

.title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: var(--on-surface);
}

.divider {
  height: 24px;
  width: 1px;
  background-color: var(--outline-variant);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
</style>
