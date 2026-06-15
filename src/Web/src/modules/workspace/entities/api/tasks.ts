import type { Row, KanbanColumn } from '../model/types'

const ROWS: Row[] = [
  { id: 1, name: 'Core API migration to Rust', status: 'In Progress', tags: ['backend', 'performance'], dueDate: 'Oct 12, 2023' },
  { id: 2, name: 'Frontend components documentation', status: 'To Do', tags: ['design', 'docs'], dueDate: 'Oct 15, 2023' },
  { id: 3, name: 'Global state management refactor', status: 'Done', tags: ['frontend'], dueDate: 'Sep 28, 2023' },
]

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    title: 'To Do',
    cards: [
      { title: 'Accessibility Audit', tags: ['compliance'] },
      { title: 'Auth Flow v2 Prototype', tags: ['security'] },
    ],
  },
  {
    title: 'In Progress',
    cards: [
      { title: 'API Rust Migration', tags: ['backend'], progress: 65 },
    ],
  },
  {
    title: 'Done',
    cards: [
      { title: 'Design Tokens Setup', tags: ['design-system'] },
    ],
  },
]

export function getTaskRows(): Row[] {
  return ROWS
}

export function getKanbanColumns(): KanbanColumn[] {
  return KANBAN_COLUMNS
}
