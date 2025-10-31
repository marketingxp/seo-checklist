import type { Item } from '@/types'
import { useUpdateItem, useDeleteItem } from './api'
import { useMemo, useState } from 'react'

export default function ItemList({ projectId, items }: { projectId: string, items: Item[] }) {
  const update = useUpdateItem(projectId)
  const del = useDeleteItem(projectId)
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return items
    return items.filter(i => i.title.toLowerCase().includes(n) || (i.notes ?? '').toLowerCase().includes(n))
  }, [q, items])

  const onReorder = (idx: number, dir: -1|1) => {
    const current = filtered[idx]
    const neighbor = filtered[idx + dir]
    if (!current || !neighbor) return
    const newPos = (current.position + neighbor.position) / 2
    update.mutate({ id: current.id, position: newPos })
  }

  return (
    <div className="space-y-2">
      <input className="w-full px-3 py-2 rounded bg-muted" placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)} />
      <div className="divide-y divide-border rounded border border-border">
        {filtered.map((i, idx) => (
          <div key={i.id} className="p-2 flex items-center gap-3">
            <button aria-label="Move up" className="px-2 py-1 rounded bg-zinc-800" onClick={() => onReorder(idx, -1)}>↑</button>
            <button aria-label="Move down" className="px-2 py-1 rounded bg-zinc-800" onClick={() => onReorder(idx, +1)}>↓</button>
            <input className="flex-1 bg-transparent" value={i.title} onChange={e=>update.mutate({ id: i.id, title: e.target.value })} />
            <select className="bg-muted rounded px-2" value={i.status} onChange={e=>update.mutate({ id: i.id, status: e.target.value as any })}>
              <option value="todo">To‑do</option>
              <option value="in_progress">In progress</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
            <input type="date" className="bg-muted rounded px-2" value={i.due_date ?? ''} onChange={e=>update.mutate({ id: i.id, due_date: e.target.value })} />
            <button className="px-2 py-1 rounded bg-rose-700" onClick={()=>del.mutate(i.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
