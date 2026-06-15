<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning'
}>(), {
  variant: 'default',
})
</script>

<template>
  <span class="app-badge" :class="`variant-${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: var(--radius-full);
}

.variant-default {
  background-color: var(--surface-container-high);
  color: var(--on-surface-variant);
}

.variant-primary {
  background-color: var(--primary-container);
  color: var(--on-primary-container);
}

.variant-success {
  background-color: var(--secondary-container);
  color: var(--on-secondary-container);
}

.variant-warning {
  background-color: var(--tertiary-container);
  color: var(--on-tertiary-container);
}
</style>
