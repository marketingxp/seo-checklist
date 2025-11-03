import type { Item } from './api'

function derivePriority(tags: string[] = []): 'low' | 'medium' | 'high' {
  const lower = tags.map(t => String(t).toLowerCase())
  if (lower.some(t => /^p0/.test(t) || /^p1/.test(t) || t === 'high')) return 'high'
  if (lower.some(t => /^p2/.test(t) || t === 'medium')) return 'medium'
  return 'low' // default or P3/none
}

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
  const tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) as string[] : []
  const priority = derivePriority(tags)

  const displayTags = tags.filter(t => !/^p[0-3]/i.test(String(t))) // hide P0/P1/P2/P3

  return (
    <div
      ref={setNodeRef}
      className={`card ${isDragging ? 'dragging' : ''}`}
      onClick={() => onOpen?.(item)}
      style={{ position:'relative', textAlign:'left' }}
      role="button"
      aria-label={`Open card ${item.title}`}
    >
      <div className="card-title" style={{display:'flex', alignItems:'center', gap:8, textAlign:'left'}}>
        <span style={{flex:1}}>{item.title}</span>
        <span
          {...(attributes||{})}
          {...(listeners||{})}
          className="badge"
          style={{cursor:'grab', userSelect:'none'}}
          onClick={(e)=>e.stopPropagation()}
          aria-label="Drag handle"
          title="Drag"
        >⇅</span>
      </div>

      <div className="card-tags" style={{textAlign:'left'}}>
        <span className={`badge priority-${priority}`}>{priority[0].toUpperCase()+priority.slice(1)}</span>
        {displayTags.map((t,i)=><span key={i} className="badge">{t}</span>)}
      </div>
    </div>
  )
}
