import type { Item, Status } from '@/types'
import { useUpdateItem } from './api'
import { useMemo } from 'react'

const STATUSES: Status[] = ['todo', 'in_progress', 'blocked', 'done']

export default function KanbanBoard({ projectId, items }: { projectId: string, items: Item[] }) {
  const update = useUpdateItem(projectId)
  const byStatus = useMemo(() =>
    Object.fromEntries(STATUSES.map(s => [s, items.filter(i => i.status === s)])), [items])

  return (
    <div className="grid grid-cols-4 gap-3">
      {STATUSES.map(s => (
        <div key={s} className="rounded border border-border p-2">
          <h3 className="capitalize mb-2 opacity-80">{s.replace('_',' ')}</h3>
          <div className="space-y-2">
            {byStatus[s].map(i => (
              <div key={i.id} className="rounded bg-muted p-2">
                <div className="font-medium">{i.title}</div>
                <div className="text-xs opacity-75">{i.tags?.join(', ')}</div>
                <div className="text-xs opacity-60">{i.due_date ?? ''}</div>
                <div className="mt-2 flex gap-1">
                  {STATUSES.map(ns => (
                    <button key={ns} className="text-xs px-2 py-1 rounded bg-zinc-800" onClick={() => {
                      const maxPos = Math.max(0, ...items.filter(x => x.status === ns).map(x => x.position || 0))
                      update.mutate({ id: i.id, status: ns, position: maxPos + 1000 })
                    }}>{ns[0].toUpperCase()}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
