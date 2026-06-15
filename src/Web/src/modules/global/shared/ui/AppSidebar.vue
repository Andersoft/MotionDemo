<script setup lang="ts">
import { inject } from 'vue'
import AppButton from './AppButton.vue'
import AppNavItem from './AppNavItem.vue'

defineProps<{
  activeNav?: string
}>()

const openTemplateGallery = inject<() => void>('openTemplateGallery', () => {})
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-icon">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1">grid_view</span>
      </div>
      <div>
        <h1 class="brand-title">Motion</h1>
        <p class="brand-subtitle">Open Source</p>
      </div>
    </div>

    <AppButton variant="primary" icon="add" class="new-page-btn" @click="openTemplateGallery">
      New Page
    </AppButton>

    <nav class="nav">
      <p class="nav-label">Main</p>
      <AppNavItem icon="grid_view" label="Workspaces" :active="activeNav === 'workspaces'" />
      <AppNavItem icon="lock" label="Private" />
      <AppNavItem icon="star" label="Favorites" />
      <AppNavItem icon="delete" label="Trash" />
    </nav>

    <div class="user-profile">
      <img
        class="avatar"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBT2hoEJ-d1MLozZfBD1jZ5YfRvlf7ZqyO7Gya5kdGlm3J3ZXCZREOTKACWVcNCa6th4M4Zd75eostHLfTEbN3ldk5NZkBYEBKWEJvwgDceadQPNY8AFlZo46rEmnVYCA9QRBwz7Wte-ryEnSP3TSOlQIO9hpmMtGfNCkX6YCE3kaXnweEsu4LY4F12dWwK43WPYgO0UqcQvW32Xc1dqQpCbql-fqEffr46qY3V3SvlodmiHplwbeqCFA"
        alt="User Profile"
      />
      <div>
        <p class="user-name">Alex Rivera</p>
        <p class="user-role">Admin</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  height: 100vh;
  width: 256px;
  border-right: 1px solid var(--outline-variant);
  background-color: var(--surface-container-low);
  display: flex;
  flex-direction: column;
  padding: var(--space-lg) 0;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-gutter);
  margin-bottom: var(--space-xl);
}

.brand-icon {
  width: 32px;
  height: 32px;
  background-color: var(--primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-primary);
}

.brand-title {
  font-family: var(--font-family);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: var(--on-surface);
}

.brand-subtitle {
  font-size: 10px;
  font-family: var(--font-family-mono);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--on-surface-variant);
}

.new-page-btn {
  width: calc(100% - var(--space-gutter) * 2);
  margin: 0 var(--space-gutter);
}

.nav {
  flex: 1;
  overflow-y: auto;
  margin-top: var(--space-lg);
}

.nav-label {
  font-size: 11px;
  font-family: var(--font-family-mono);
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-xs);
  padding: 0 var(--space-gutter);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  margin: 0 var(--space-gutter);
  margin-top: auto;
  border-radius: var(--radius-lg);
  transition: background-color 0.15s;
  cursor: pointer;
}

.user-profile:hover {
  background-color: var(--surface-container-high);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 10px;
  font-family: var(--font-family-mono);
  color: var(--on-surface-variant);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
