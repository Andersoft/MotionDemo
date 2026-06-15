<script setup lang="ts">
import { ref } from 'vue'
import { AppButton, AppLayout, AppPageLayout } from '@global'
import type { PageTab } from '@global'
import { KanbanBoard } from '@widgets'
import { DatabaseTable } from '@widgets'
import type { View } from '@entities'

const activeView = ref<View>('table')

const views: PageTab[] = [
  { key: 'table', icon: 'table_chart', label: 'Table' },
  { key: 'board', icon: 'view_kanban', label: 'Board' },
  { key: 'calendar', icon: 'calendar_today', label: 'Calendar' },
]
</script>

<template>
  <AppLayout title="Workspace Editor">
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
  </AppLayout>
</template>
