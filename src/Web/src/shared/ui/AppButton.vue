<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
})

defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<template>
  <button
    class="app-btn"
    :class="[`variant-${variant}`, `size-${size}`, { 'has-icon': icon }]"
    :disabled="disabled"
    @click="(e: MouseEvent) => $emit('click', e)"
  >
    <span v-if="icon" class="material-symbols-outlined btn-icon">{{ icon }}</span>
    <slot />
  </button>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-family: inherit;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, opacity 0.15s, transform 0.15s, border-color 0.15s;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.app-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.size-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: 12px;
}
.size-md {
  padding: var(--space-sm) var(--space-md);
  font-size: 14px;
}
.size-lg {
  padding: var(--space-sm) var(--space-lg);
  font-size: 14px;
}

.variant-primary {
  background-color: var(--primary);
  color: var(--on-primary);
  border-color: var(--primary);
}
.variant-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.variant-outline {
  background: none;
  color: var(--primary);
  border-color: var(--primary);
}
.variant-outline:hover:not(:disabled) {
  background-color: var(--primary);
  color: var(--on-primary);
}

.variant-ghost {
  background: none;
  color: var(--on-surface-variant);
  border-color: transparent;
}
.variant-ghost:hover:not(:disabled) {
  background-color: var(--surface-container);
}

.app-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-icon {
  font-size: 18px;
}
</style>
