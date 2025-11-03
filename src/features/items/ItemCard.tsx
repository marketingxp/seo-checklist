import type { Item } from './api'

export default function ItemCard({
  item,
  onOpen,
  dragProps
}: {
  item: Item
  onOpen?: (it: Item) => void
  dragProps?: {
    setNodeRef: (node: HTMLElement | null) => void
    attributes: Record<string, any>
    listeners: Record<string, any>
    isDragging: boolean
  }
}) {
  const { setNodeRef, attributes, listeners, isDragging } = dragProps || {}
  const rawTags = Array.isArray(item.tags) ? item.tags.filter(Boolean) as string[] : []
  const pr = rawTags.find(t => ['high','medium','low'].includes(t.toLowerCase()))
  const others = rawTags.filter(t => t.toLowerCase() !== (pr || '').toLowerCase())

  return (
    <div
      ref={setNodeRef}
      className={`card ${isDragging ? 'dragging' : ''}`}
      onClick={() => onOpen?.(item)}
      style={{ position:'relative' }}
    >
      <div className="card-title" style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{flex:1}}>{item.title}</span>
        <span {...(attributes||{})} {...(listeners||{})} className="badge" style={{cursor:'grab'}}>⇅</span>
      </div>
      {(pr || others.length>0) && (
        <div className="card-tags">
          {pr && <span className={`badge priority-${pr.toLowerCase()}`}>{pr[0].toUpperCase()+pr.slice(1)}</span>}
          {others.map((t,i)=><span key={i} className="badge">{t}</span>)}
        </div>
      )}
    </div>
  )
}
