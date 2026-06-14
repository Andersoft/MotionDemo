<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppPageLayout } from '@/shared/ui'
import type { PageTab } from '@/shared/ui/AppPageLayout.vue'
import { KanbanBoard } from '../widgets'
import { DatabaseTable } from '../widgets'

type View = 'table' | 'board' | 'calendar'
const activeView = ref<View>('table')

const views: PageTab[] = [
  { key: 'table', icon: 'table_chart', label: 'Table' },
  { key: 'board', icon: 'view_kanban', label: 'Board' },
  { key: 'calendar', icon: 'calendar_today', label: 'Calendar' },
]
</script>

<template>
  <AppPageLayout
    :breadcrumb="['Engineering', 'Q3 Roadmap']"
    title="System Architecture Tasks"
    :tabs="views"
    :active-tab="activeView"
    @update:active-tab="activeView = $event as View"
  >
    <template #tab-actions>
      <AppButton variant="ghost" size="sm" icon="filter_list">Filter</AppButton>
      <AppButton variant="ghost" size="sm" icon="sort">Sort</AppButton>
    </template>

    <DatabaseTable v-if="activeView === 'table'" />
    <KanbanBoard v-else-if="activeView === 'board'" />
  </AppPageLayout>
</template>
