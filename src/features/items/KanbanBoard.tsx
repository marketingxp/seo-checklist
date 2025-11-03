import { useMemo } from 'react'
import ItemCard from './ItemCard'
import type { Item } from './api'

type Props = { projectId: string; items: Item[]; onOpen?: (it: Item)=>void }
const COLS: { key: Item['status']; label: string }[] = [
  { key: 'todo', label: 'To-do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' },
]

export default function KanbanBoard({ projectId, items, onOpen }: Props) {
  const byStatus = useMemo(() => ({
    todo: items.filter(i => i.status === 'todo'),
    in_progress: items.filter(i => i.status === 'in_progress'),
    blocked: items.filter(i => i.status === 'blocked'),
    done: items.filter(i => i.status === 'done'),
  }), [items])

  return (
    <div className="board">
      {COLS.map(c => (
        <div key={c.key} className="column">
          <div className="column-head">
            <div className="column-title">
              <div>{c.label}</div>
              <span className="column-count">{byStatus[c.key].length}</span>
            </div>
          </div>
          <div className="column-scroller">
            {byStatus[c.key].map(item => (
              <ItemCard key={item.id} item={item} projectId={projectId} onOpen={onOpen} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
