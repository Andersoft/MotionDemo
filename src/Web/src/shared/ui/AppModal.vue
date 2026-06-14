<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  visible: boolean
  title?: string
  subtitle?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const overlayRef = ref<HTMLDivElement>()

function onOverlayClick(e: MouseEvent) {
  if (e.target === overlayRef.value) {
    emit('close')
  }
}

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', onEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="overlayRef"
      class="modal-overlay"
      :class="{ visible }"
      @click="onOverlayClick"
    >
      <div class="modal-container" :class="{ 'modal-enter': visible }">
        <div v-if="title" class="modal-header">
          <div>
            <h2 v-if="title" class="modal-title">{{ title }}</h2>
            <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
          </div>
          <slot name="header-actions">
            <button class="close-btn" @click="emit('close')">
              <span class="material-symbols-outlined">close</span>
            </button>
          </slot>
        </div>

        <div class="modal-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-gutter);
  background-color: rgba(248, 249, 251, 0.6);
  backdrop-filter: blur(8px);
  opacity: 0;
  transition: opacity 0.3s;
}

.modal-overlay.visible {
  opacity: 1;
}

.modal-container {
  background-color: var(--surface-container-lowest);
  width: 100%;
  max-width: 1000px;
  max-height: 921px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--outline-variant);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  transform: scale(0.95) translateY(10px);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

.modal-container.modal-enter {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-header {
  padding: var(--space-xl) var(--space-xl) var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(198, 198, 205, 0.3);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: var(--primary);
  margin-bottom: var(--space-xs);
}

.modal-subtitle {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--on-surface-variant);
}

.close-btn {
  padding: var(--space-sm);
  background: none;
  border: none;
  border-radius: var(--radius-lg);
  color: var(--on-surface-variant);
  transition: background-color 0.15s;
  cursor: pointer;
}

.close-btn:hover {
  background-color: var(--surface-container);
}

.close-btn:hover .material-symbols-outlined {
  color: var(--primary);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
}

.modal-footer {
  padding: var(--space-xl);
  border-top: 1px solid rgba(198, 198, 205, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--surface-container-low);
}
</style>
