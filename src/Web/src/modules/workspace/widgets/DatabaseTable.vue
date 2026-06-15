<script setup lang="ts">
import { ref } from 'vue'
import { AppBadge, AppButton, AppTable } from '@global'
import type { Column } from '@global'
import type { Row } from '@entities'
import { getTaskRows } from '@entities'

const columns: Column[] = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'tags', label: 'Tags' },
  { key: 'dueDate', label: 'Due Date' },
]

const rows = ref<Row[]>(getTaskRows())

function statusVariant(status: string) {
  if (status === 'In Progress') return 'success'
  if (status === 'Done') return 'warning'
  return 'default'
}
</script>

<template>
  <AppTable :columns="columns" :rows="rows">
    <template #cell="{ column, value }">
      <div v-if="column.key === 'name'" class="cell-name">
        <span class="material-symbols-outlined drag-icon">drag_indicator</span>
        {{ value }}
      </div>
      <AppBadge v-else-if="column.key === 'status'" :variant="statusVariant(value as string)">{{ value }}</AppBadge>
      <div v-else-if="column.key === 'tags'" class="tags">
        <span v-for="tag in (value as string[])" :key="tag" class="tag">#{{ tag }}</span>
      </div>
      <span v-else-if="column.key === 'dueDate'" class="cell-due">{{ value }}</span>
      <span v-else>{{ value }}</span>
    </template>

    <template #footer>
      <div class="new-task-btn">
        <AppButton variant="ghost">
          + New Task
        </AppButton>
      </div>
    </template>
  </AppTable>
</template>

<style scoped>
.cell-name {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.drag-icon {
  color: var(--outline);
  font-size: 18px;
}

.tags {
  display: flex;
  gap: var(--space-xs);
}

.tag {
  color: var(--outline);
  font-size: 14px;
}

.cell-due {
  font-family: var(--font-family-mono);
  font-size: 14px;
  color: var(--outline);
}

.new-task-btn {
  border-top: 1px solid var(--outline-variant);
}

.new-task-btn :deep(.app-btn) {
  width: 100%;
  padding: var(--space-sm) var(--space-xl);
  justify-content: flex-start;
  color: var(--outline);
  border-radius: 0;
}

.new-task-btn :deep(.app-btn:hover) {
  color: var(--on-surface-variant);
}
</style>
