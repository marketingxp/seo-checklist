import { useParams } from 'react-router-dom'
import { useItems, useCreateItem, Item } from '@/features/items/api'
import ItemList from '@/features/items/ItemList'
import KanbanBoard from '@/features/items/KanbanBoard'
import ItemModal from '@/features/items/ItemModal'
import { useState } from 'react'

export default function ProjectPage() {
  const { id = '' } = useParams()
  const { data = [] } = useItems(id)
  const create = useCreateItem(id)
  const [title, setTitle] = useState('')
  const [openItem, setOpenItem] = useState<Item|null>(null)

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <input className="input" placeholder="Add item…" value={title} onChange={e=>setTitle(e.target.value)} />
        <button className="btn btn-primary" onClick={()=>{ if (!title) return; create.mutate({ title, status: 'todo', tags: [], position: Date.now() }); setTitle('') }}>Add</button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl mb-2">List</h2>
          <ItemList projectId={id} items={data} />
        </div>
        <div>
          <h2 className="text-xl mb-2">Board</h2>
          <KanbanBoard projectId={id} items={data} onOpen={setOpenItem} />
        </div>
      </div>
      {openItem && (
        <ItemModal open={!!openItem} onClose={()=>setOpenItem(null)} projectId={id} item={openItem} />
      )}
    </div>
  )
}
