import type { Item } from './api'

export default function ItemList({ projectId, items, onOpen }: { projectId: string; items: Item[]; onOpen?: (it: Item)=>void }) {
  return (
    <ul className="list">
      {items.map(it => (
        <li key={it.id} className="li">
          <button className="card" style={{width:'100%', textAlign:'left'}} onClick={()=>onOpen?.(it)}>
            <div className="card-title" style={{marginBottom:6}}>{it.title}</div>
            {it.notes && <div className="meta" style={{whiteSpace:'pre-wrap'}}>{it.notes}</div>}
          </button>
        </li>
      ))}
    </ul>
  )
}
