import type { Item } from './api'
export default function ItemCard({item}:{item:Item}){
  return (
    <div className="card">
      <div className="card-title">{item.title}</div>
      {Array.isArray(item.tags)&&item.tags.length>0&&(
        <div className="card-tags">
          {item.tags.map(t=> <span key={t} className="badge">{t}</span>)}
        </div>
      )}
    </div>
  )
}
