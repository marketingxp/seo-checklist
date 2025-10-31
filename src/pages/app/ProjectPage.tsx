import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/query'

import { useItems, useCreateItem } from '@/features/items/api'
import ItemList from '@/features/items/ItemList'
import KanbanBoard from '@/features/items/KanbanBoard'

export default function ProjectPage() {
  const { id = '' } = useParams()
  const { data } = useItems(id)
  const items = useMemo(() => (Array.isArray(data) ? data : []), [data])

  const create = useCreateItem(id)
  const [title, setTitle] = useState('')

  // Realtime: refresh items for this project on any DB change
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`items:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items', filter: `project_id=eq.${id}` },
        () => queryClient.invalidateQueries({ queryKey: ['items', id] })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id])

  const addItem = () => {
    if (!title.trim()) return
    create.mutate({
      title: title.trim(),
      status: 'todo',
      tags: [], // guard: always an array
      position: Date.now(),
    })
    setTitle('')
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <input
          className="px-3 py-2 rounded bg-muted w-full max-w-md"
          placeholder="Add item…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addItem()
          }}
          aria-label="New item title"
        />
        <button className="px-3 py-2 rounded bg-sky-600" onClick={addItem}>
          Add
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl mb-2">List</h2>
          <ItemList projectId={id} items={items} />
        </div>
        <div>
          <h2 className="text-xl mb-2">Board</h2>
          <KanbanBoard projectId={id} items={items} />
        </div>
      </div>
    </div>
  )
}
