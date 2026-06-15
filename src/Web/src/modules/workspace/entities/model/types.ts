export type View = 'table' | 'board' | 'calendar'

export interface Row {
  id: number
  name: string
  status: string
  tags: string[]
  dueDate: string
}

export interface KanbanCard {
  title: string
  tags: string[]
  progress?: number
}

export interface KanbanColumn {
  title: string
  cards: KanbanCard[]
}
