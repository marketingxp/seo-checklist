import type { Item } from './api'
import { useUpdateItem } from './api'
import StatusBadge from '@/components/StatusBadge'

export default function KanbanBoard({ projectId, items }: { projectId: string; items: Item[] }) {
  const update = useUpdateItem(projectId)
  const cols: { key: Item['status']; title: string }[] = [
    { key: 'todo', title: 'To-do' },
    { key: 'in_progress', title: 'In progress' },
    { key: 'blocked', title: 'Blocked' },
    { key: 'done', title: 'Done' },
  ]
  return (
    <div className="kanban">
      {cols.map(c => {
        const inCol = items.filter(i => i.status===c.key)
        return (
          <div key={c.key} className="col">
            <div className="col-head">
              <div className="row row-gap">
                <StatusBadge status={c.key} />
                <div>{c.title}</div>
              </div>
              <div className="col-count">{inCol.length}</div>
            </div>
            <div>
              {inCol.map(i => (
                <div key={i.id} className="ticket">
                  <div className="ticket-title">{i.title}</div>
                  <div className="stack" style={{margin:'8px 0'}}>
                    {(i.tags||[]).map(t => <span key={t} className="badge">{t}</span>)}
                  </div>
                  <div className="row row-gap">
                    <button className="btn btn-ghost" onClick={() => update.mutate({ id: i.id, status: 'todo' })}>T</button>
                    <button className="btn btn-ghost" onClick={() => update.mutate({ id: i.id, status: 'in_progress' })}>I</button>
                    <button className="btn btn-ghost" onClick={() => update.mutate({ id: i.id, status: 'blocked' })}>B</button>
                    <button className="btn btn-ghost" onClick={() => update.mutate({ id: i.id, status: 'done' })}>D</button>
                  </div>
                </div>
              ))}
              {inCol.length===0 && <div className="card card-pad" style={{margin:12}}>Empty</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
