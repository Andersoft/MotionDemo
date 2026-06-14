<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  label: string
  active?: boolean
  href?: string
}>(), {
  active: false,
  href: '#',
})

defineEmits<{
  click: [e: MouseEvent]
}>()
</script>

<template>
  <a
    class="nav-item"
    :class="{ active }"
    :href="href"
    @click.prevent="$emit('click', $event)"
  >
    <span class="material-symbols-outlined">{{ icon }}</span>
    <span class="nav-item-text">{{ label }}</span>
  </a>
</template>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  height: 40px;
  color: var(--on-surface-variant);
  padding-left: 16px;
  transition: background-color 0.15s;
  cursor: pointer;
  text-decoration: none;
}

.nav-item:hover {
  background-color: var(--surface-container-high);
}

.nav-item.active {
  color: var(--primary);
  font-weight: 700;
  border-left: 2px solid var(--primary);
  padding-left: 12px;
}

.nav-item-text {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
}

.nav-item.active .nav-item-text {
  font-weight: 700;
}
</style>
