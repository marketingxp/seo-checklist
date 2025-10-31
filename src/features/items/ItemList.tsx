import type { Item } from './api'
import { useUpdateItem, useDeleteItem } from './api'
import StatusBadge from '@/components/StatusBadge'

export default function ItemList({ projectId, items }: { projectId: string; items: Item[] }) {
  const update = useUpdateItem(projectId)
  const del = useDeleteItem(projectId)
  const statuses: Item['status'][] = ['todo','in_progress','blocked','done']

  return (
    <ul className="list">
      {items.map(it => (
        <li key={it.id} className="li">
          <div className="row row-gap" style={{justifyContent:'space-between'}}>
            <div style={{flex:1, minWidth:0}}>
              <div className="row row-gap">
                <StatusBadge status={it.status} />
                <div style={{fontWeight:600}}>{it.title}</div>
              </div>
              <div className="meta">{(it.tags||[]).join(', ')}</div>
            </div>
            <div className="row row-gap">
              <select
                className="select"
                value={it.status}
                onChange={e => update.mutate({ id: it.id, status: e.target.value as Item['status'] })}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="btn btn-danger" onClick={() => del.mutate(it.id)}>Delete</button>
            </div>
          </div>
        </li>
      ))}
      {items.length === 0 && <li className="li">No items yet.</li>}
    </ul>
  )
}
