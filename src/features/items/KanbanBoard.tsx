import type { Item } from './api'
import { useUpdateItem } from './api'

export default function KanbanBoard({ projectId, items }: { projectId: string; items: Item[] }) {
  const update = useUpdateItem(projectId)
  const cols: { key: Item['status']; title: string }[] = [
    { key: 'todo', title: 'To-do' },
    { key: 'in_progress', title: 'In progress' },
    { key: 'blocked', title: 'Blocked' },
    { key: 'done', title: 'Done' },
  ]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
      {cols.map(c => (
        <div key={c.key} style={{ border:'1px solid #eee', borderRadius:6, padding:12 }}>
          <div style={{ fontWeight:600, marginBottom:8 }}>{c.title}</div>
          <div style={{ display:'grid', gap:8 }}>
            {items.filter(i => i.status===c.key).map(i => (
              <div key={i.id} style={{ border:'1px solid #ddd', padding:8, borderRadius:6, background:'#fafafa' }}>
                <div style={{ fontWeight:500 }}>{i.title}</div>
                <button onClick={() => update.mutate({ id: i.id, status: 'todo' })} style={{ marginRight:4 }}>T</button>
                <button onClick={() => update.mutate({ id: i.id, status: 'in_progress' })} style={{ marginRight:4 }}>I</button>
                <button onClick={() => update.mutate({ id: i.id, status: 'blocked' })} style={{ marginRight:4 }}>B</button>
                <button onClick={() => update.mutate({ id: i.id, status: 'done' })}>D</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
