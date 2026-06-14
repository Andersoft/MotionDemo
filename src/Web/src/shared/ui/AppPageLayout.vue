<script setup lang="ts">

export interface PageTab {
  key: string
  icon: string
  label: string
}

withDefaults(defineProps<{
  breadcrumb?: string[]
  title?: string
  tabs?: PageTab[]
  activeTab?: string
}>(), {
  breadcrumb: () => [],
})

defineEmits<{
  'update:activeTab': [key: string]
}>()
</script>

<template>
  <div class="layout">
    <div class="layout-scroll">
      <div class="layout-inner">
        <div v-if="title" class="page-header">
          <div v-if="breadcrumb.length" class="breadcrumb">
            <span class="material-symbols-outlined breadcrumb-icon">folder</span>
            <span class="breadcrumb-path">
              <template v-for="(segment, idx) in breadcrumb" :key="idx">
                <template v-if="idx > 0">
                  <span class="breadcrumb-sep">/</span>
                </template>
                {{ segment }}
              </template>
            </span>
          </div>
          <h2 class="page-title">{{ title }}</h2>
        </div>

        <div v-if="tabs && tabs.length" class="tab-bar">
          <div class="tab-group">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="tab"
              :class="{ active: activeTab === tab.key }"
              @click="$emit('update:activeTab', tab.key)"
            >
              <span v-if="tab.icon" class="material-symbols-outlined tab-icon">{{ tab.icon }}</span>
              <span class="tab-label">{{ tab.label }}</span>
            </button>
          </div>
          <div v-if="$slots['tab-actions']" class="tab-actions">
            <slot name="tab-actions" />
          </div>
        </div>

        <slot />

        <div v-if="$slots.footer" class="footer">
          <slot name="footer" />
        </div>
        <div v-else class="footer">
          <p class="footer-text">Last edited by Alex Rivera • 2 hours ago</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.layout-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.layout-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-gutter);
}

.page-header {
  margin-bottom: var(--space-xl);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--outline);
  margin-bottom: var(--space-sm);
}

.breadcrumb-icon {
  font-size: 14px;
}

.breadcrumb-path {
  font-size: 11px;
  font-family: var(--font-family-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.breadcrumb-sep {
  margin: 0 2px;
  opacity: 0.6;
}

.page-title {
  font-size: 48px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: var(--on-surface);
  margin-bottom: var(--space-md);
}

.tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--outline-variant);
  margin-bottom: var(--space-lg);
}

.tab-group {
  display: flex;
  align-items: center;
}

.tab {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--on-surface-variant);
  font-family: inherit;
  transition: color 0.15s;
  cursor: pointer;
}

.tab:hover {
  color: var(--on-surface);
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

.tab-icon {
  font-size: 18px;
}

.tab-label {
  font-size: 14px;
  line-height: 1;
}

.tab-actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.footer {
  margin-top: var(--space-2xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--outline-variant);
}

.footer-text {
  font-size: 14px;
  color: var(--outline);
  text-align: center;
}
</style>
