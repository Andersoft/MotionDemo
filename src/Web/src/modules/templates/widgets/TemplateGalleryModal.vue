<script setup lang="ts">
import { ref } from 'vue'
import { AppModal, AppButton } from '@global'
import { TemplateCard, getTemplates } from '@entities'

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)

const templates = getTemplates()

setTimeout(() => {
  visible.value = true
}, 0)
</script>

<template>
  <AppModal
    :visible="visible"
    title="Template Gallery"
    subtitle="Jumpstart your workspace with precision-engineered open-source templates."
    @close="emit('close')"
  >
    <div class="template-grid">
      <TemplateCard
        v-for="(tmpl, idx) in templates"
        :key="idx"
        v-bind="tmpl"
        @select="emit('close')"
      />
    </div>

    <template #footer>
      <div class="footer-left">
        <div class="avatar-stack">
          <div class="avatar-circle avatar-p"></div>
          <div class="avatar-circle avatar-s"></div>
          <div class="avatar-circle avatar-o"></div>
        </div>
        <span class="footer-text">42 more templates available in community repo</span>
      </div>
      <div class="browse-btn">
        <AppButton variant="outline" icon="open_in_new">
          BROWSE GITHUB
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.template-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

@media (max-width: 1024px) {
  .template-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
}

.footer-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar-stack {
  display: flex;
  margin-left: 8px;
}

.avatar-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--surface-container-lowest);
  margin-left: -8px;
}

.avatar-circle:first-child {
  margin-left: 0;
}

.avatar-p {
  background-color: var(--primary);
}

.avatar-s {
  background-color: var(--secondary);
}

.avatar-o {
  background-color: var(--outline);
}

.footer-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--on-surface-variant);
}

.browse-btn :deep(.app-btn) {
  font-family: var(--font-family-mono);
  font-size: 12px;
}
</style>
