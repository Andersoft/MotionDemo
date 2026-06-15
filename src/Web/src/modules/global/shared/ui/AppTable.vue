<script setup lang="ts">
export interface Column {
  key: string
  label: string
}

defineProps<{
  columns: Column[]
  rows: Record<string, unknown>[]
}>()

defineSlots<{
  cell(props: { column: Column; row: Record<string, unknown>; value: unknown }): void
  footer(): void
}>()
</script>

<template>
  <div class="table-wrapper">
    <div class="table-container">
      <table class="app-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="idx" class="data-row">
            <td v-for="col in columns" :key="col.key">
              <slot name="cell" :column="col" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  height: 100%;
  overflow: auto;
}

.table-container {
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.app-table {
  width: 100%;
  text-align: left;
  border-collapse: collapse;
}

th {
  background-color: var(--surface-container-low);
  padding: var(--space-sm) var(--space-md);
  font-size: 11px;
  font-family: var(--font-family-mono);
  color: var(--outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  border-bottom: 1px solid var(--outline-variant);
}

.data-row td {
  padding: var(--space-md);
  border-bottom: 1px solid var(--outline-variant);
  font-size: 16px;
  line-height: 1.6;
  color: var(--on-surface);
}

.data-row:last-child td {
  border-bottom: none;
}

.data-row:hover td {
  background-color: var(--surface-container);
}
</style>
