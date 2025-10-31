import type { Item } from './api'
import { useUpdateItem, useDeleteItem } from './api'

export default function ItemList({ projectId, items }: { projectId: string; items: Item[] }) {
  const update = useUpdateItem(projectId)
  const del = useDeleteItem(projectId)

  const statuses: Item['status'][] = ['todo','in_progress','blocked','done']

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {items.map(it => (
        <li key={it.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <div><b>{it.title}</b></div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{(it.tags||[]).join(', ')}</div>
          <div style={{ marginTop: 4 }}>
            <select
              value={it.status}
              onChange={e => update.mutate({ id: it.id, status: e.target.value as Item['status'] })}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => del.mutate(it.id)} style={{ marginLeft: 8 }}>Delete</button>
          </div>
        </li>
      ))}
      {items.length === 0 && <li>No items yet.</li>}
    </ul>
  )
}
