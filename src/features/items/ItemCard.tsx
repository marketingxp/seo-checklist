import type { Item } from './api'
import { getPriority } from './priority'
export default function ItemCard({item,onOpen}:{item:Item;onOpen?:()=>void}){
  const p = getPriority(item.tags)
  const hiddenTags = new Set(['low','medium','high','p0 • critical','p1 • high','p2 • medium','p3 • low'])
  const displayTags = Array.isArray(item.tags)
    ? item.tags.filter(t=>{
        if(!t) return false
        const normalized = t.trim().toLowerCase()
        if(normalized.startsWith('prio:')) return false
        return !hiddenTags.has(normalized)
      })
    : []
  const priorityLabel = p[0]?.toUpperCase() + p.slice(1)

  return (
    <button onClick={onOpen} className="card task-card" style={{textAlign:'left'}}>
      <div className="card-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}>
        <span>{item.title}</span>
        <span className={`badge priority-${p}`}>{priorityLabel}</span>
      </div>
      {displayTags.length>0&&(
        <div className="card-tags">
          {displayTags.map(t=> <span key={t} className="badge">{t}</span>)}
        </div>
      )}
    </button>
  )
}
