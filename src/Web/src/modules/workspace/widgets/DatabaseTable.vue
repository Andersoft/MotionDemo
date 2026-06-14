<script setup lang="ts">
import { ref } from 'vue'
import { AppBadge, AppButton, AppTable } from '@/shared/ui'
import type { Column } from '@/shared/ui/AppTable.vue'

interface Row {
  id: number
  name: string
  status: string
  tags: string[]
  dueDate: string
}

const columns: Column[] = [
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
  { key: 'tags', label: 'Tags' },
  { key: 'dueDate', label: 'Due Date' },
]

const rows = ref<Row[]>([
  { id: 1, name: 'Core API migration to Rust', status: 'In Progress', tags: ['backend', 'performance'], dueDate: 'Oct 12, 2023' },
  { id: 2, name: 'Frontend components documentation', status: 'To Do', tags: ['design', 'docs'], dueDate: 'Oct 15, 2023' },
  { id: 3, name: 'Global state management refactor', status: 'Done', tags: ['frontend'], dueDate: 'Sep 28, 2023' },
])

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
      <AppButton variant="ghost" class="new-task-btn">
        + New Task
      </AppButton>
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
  width: 100%;
  padding: var(--space-sm) var(--space-xl);
  border-top: 1px solid var(--outline-variant);
  justify-content: flex-start;
  color: var(--outline);
  border-radius: 0;
}

.new-task-btn:hover {
  color: var(--on-surface-variant);
}
</style>
