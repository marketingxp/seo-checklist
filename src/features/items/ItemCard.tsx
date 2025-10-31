import type { Item } from './api'
import { getPriority, prioColors } from './priority'
export default function ItemCard({item,onOpen}:{item:Item;onOpen?:()=>void}){
  const p = getPriority(item.tags)
  return (
    <button onClick={onOpen} className="card" style={{textAlign:'left',borderColor:'var(--border)'}}>
      <div className="card-title" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <span>{item.title}</span>
        <span className="badge" style={{borderColor:'transparent',background:'transparent',color:prioColors[p]}}>● {p}</span>
      </div>
      {Array.isArray(item.tags)&&item.tags.filter(t=>!t.startsWith('prio:')).length>0&&(
        <div className="card-tags">
          {item.tags.filter(t=>!t.startsWith('prio:')).map(t=> <span key={t} className="badge">{t}</span>)}
        </div>
      )}
    </button>
  )
}
