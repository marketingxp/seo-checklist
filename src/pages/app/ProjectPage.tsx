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

  const add = () => {
    const t = title.trim()
    if (!t) return
    create.mutate({ title: t, status: 'todo', tags: [], position: Date.now() })
    setTitle('')
  }

  return (
    <div style={{ padding: 24, fontFamily:'system-ui' }}>
      <div style={{ marginBottom: 12 }}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add item…" onKeyDown={e=>e.key==='Enter'&&add()} />
        <button onClick={add} style={{ marginLeft: 8 }}>Add</button>
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
