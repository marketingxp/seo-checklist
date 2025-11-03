import { useParams } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useItems, useCreateItem } from '@/features/items/api'
import ItemList from '@/features/items/ItemList'
import KanbanBoard from '@/features/items/KanbanBoard'

export default function ProjectPage() {
  const { id = '' } = useParams()
  const { data } = useItems(id)
  const items = useMemo(() => Array.isArray(data) ? data : [], [data])
  const create = useCreateItem(id)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')

  const add = () => {
    const t = title.trim()
    const cat = category.trim()
    if (!t) return
    const tags = cat ? [cat] : []
    create.mutate({ title: t, status: 'todo', tags, position: Date.now() })
    setTitle('')
    setCategory('')
  }

  return (
    <div style={{ padding: 24, fontFamily:'system-ui' }}>
      <div style={{ marginBottom: 16, display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
        <input
          className="input"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          placeholder="Add item…"
          onKeyDown={e=>e.key==='Enter'&&add()}
          style={{ flex:'1 1 220px', minWidth:220 }}
        />
        <input
          className="input"
          value={category}
          onChange={e=>setCategory(e.target.value)}
          placeholder="Category badge (optional)"
          onKeyDown={e=>e.key==='Enter'&&add()}
          style={{ flex:'1 1 200px', minWidth:200 }}
        />
        <button className="btn btn-primary" onClick={add} style={{ flex:'0 0 auto', minWidth:96 }}>Add</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div>
          <h3>List</h3>
          <ItemList projectId={id} items={items} />
        </div>
        <div>
          <h3>Board</h3>
          <KanbanBoard projectId={id} items={items} />
        </div>
      </div>
    </div>
  )
}
