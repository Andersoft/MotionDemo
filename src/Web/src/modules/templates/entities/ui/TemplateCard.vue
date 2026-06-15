<script setup lang="ts">
import { AppButton } from '@global'
import type { Template } from '../model/template'

defineProps<Template>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <div class="card">
    <div class="card-image">
      <img :src="image" :alt="title" class="image" />
    </div>
    <div class="card-body">
      <div class="category">
        <span class="material-symbols-outlined category-icon">{{ icon }}</span>
        <span class="category-label">{{ category }}</span>
      </div>
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-desc">{{ description }}</p>
      <div class="use-btn">
        <AppButton variant="outline" @click="$emit('select')">
          Use this template
        </AppButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--outline-variant);
  transition: border-color 0.3s;
}

.card:hover {
  border-color: var(--primary);
}

.card-image {
  aspect-ratio: 16 / 9;
  background-color: var(--surface-container-low);
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
  opacity: 0.8;
  transition: filter 0.5s, opacity 0.5s;
}

.card:hover .image {
  filter: grayscale(0);
  opacity: 1;
}

.card-body {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.category {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.category-icon {
  color: var(--primary);
  font-size: 16px;
}

.category-label {
  font-size: 12px;
  font-family: var(--font-family-mono);
  color: var(--on-surface-variant);
}

.card-title {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: var(--on-surface);
  margin-bottom: var(--space-md);
}

.card-desc {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--on-surface-variant);
  flex: 1;
  margin-bottom: var(--space-xl);
}

.use-btn :deep(.app-btn) {
  width: 100%;
}
</style>
