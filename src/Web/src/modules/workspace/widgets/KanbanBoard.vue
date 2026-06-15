<script setup lang="ts">
import type { KanbanColumn } from '@entities'
import { getKanbanColumns } from '@entities'

const columns: KanbanColumn[] = getKanbanColumns()
</script>

<template>
  <div class="board">
    <div v-for="col in columns" :key="col.title" class="board-column">
      <div class="column-header">
        <div class="column-title-row">
          <span class="column-label">{{ col.title }}</span>
          <span class="column-count">{{ col.cards.length }}</span>
        </div>
        <span class="material-symbols-outlined add-btn">add</span>
      </div>

      <div class="card-list">
        <div
          v-for="card in col.cards"
          :key="card.title"
          class="card"
          :class="{ 'card-done': col.title === 'Done' }"
        >
          <p class="card-title" :class="{ 'title-done': col.title === 'Done' }">{{ card.title }}</p>
          <div class="card-tags">
            <span v-for="tag in card.tags" :key="tag" class="card-tag">#{{ tag }}</span>
          </div>
          <div v-if="card.progress !== undefined" class="progress-bar">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: card.progress + '%' }"></div>
            </div>
            <span class="progress-label">{{ card.progress }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
  height: 100%;
  overflow-x: auto;
}

.board-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xs);
}

.column-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.column-label {
  font-size: 11px;
  font-family: var(--font-family-mono);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--outline);
}

.column-count {
  font-size: 11px;
  font-family: var(--font-family-mono);
  background-color: var(--surface-container);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--on-surface-variant);
}

.add-btn {
  color: var(--outline);
  font-size: 20px;
  cursor: pointer;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.card {
  padding: var(--space-md);
  background-color: var(--surface);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  transition: border-color 0.15s;
  cursor: pointer;
}

.card:hover {
  border-color: var(--outline);
}

.card-done {
  opacity: 0.6;
  filter: grayscale(1);
}

.card-done:hover {
  opacity: 1;
  filter: grayscale(0);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--on-surface);
  margin-bottom: var(--space-sm);
}

.title-done {
  text-decoration: line-through;
  text-decoration-color: var(--primary);
}

.card-tags {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.card-tag {
  font-size: 10px;
  font-family: var(--font-family-mono);
  color: var(--outline);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.progress-track {
  flex: 1;
  height: 4px;
  background-color: var(--surface-container);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary);
  border-radius: var(--radius-full);
  transition: width 0.3s;
}

.progress-label {
  font-size: 10px;
  font-family: var(--font-family-mono);
  color: var(--outline);
}
</style>
