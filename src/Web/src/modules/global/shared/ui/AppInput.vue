<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
  icon?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="input-box">
    <span v-if="icon" class="material-symbols-outlined input-icon">{{ icon }}</span>
    <input
      :value="modelValue"
      class="app-input"
      :class="{ 'has-icon': icon }"
      type="text"
      :placeholder="placeholder"
      @input="(e: Event) => $emit('update:modelValue', (e.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.input-box {
  display: flex;
  align-items: center;
  background-color: var(--surface-container);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  gap: var(--space-sm);
}

.input-icon {
  color: var(--on-surface-variant);
  font-size: 18px;
}

.app-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  width: 192px;
  color: var(--on-surface);
  font-family: inherit;
}

.app-input::placeholder {
  color: var(--outline);
}
</style>
