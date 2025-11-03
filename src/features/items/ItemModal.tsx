import { useState, useEffect } from 'react'
import { useDeleteItem, useUpdateItem, Item } from './api'

function derivePriority(tags: string[] = []): 'low'|'medium'|'high' {
  const lower = tags.map(t => String(t).toLowerCase())
  if (lower.includes('high')) return 'high'
  if (lower.includes('medium')) return 'medium'
  return 'low'
}

export default function ItemModal({
  open,
  onClose,
  projectId,
  item
}: {
  open: boolean
  onClose: () => void
  projectId: string
  item: Item
}) {
  const [title, setTitle] = useState(item.title)
  const [priority, setPriority] = useState<'low'|'medium'|'high'>(derivePriority(item.tags as any))
  const [notes, setNotes] = useState(item.notes ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const update = useUpdateItem(projectId)
  const del = useDeleteItem(projectId)

  useEffect(() => {
    setTitle(item.title)
    setNotes(item.notes ?? '')
    setPriority(derivePriority(item.tags as any))
    setConfirmDelete(false)
  }, [item])

  function save() {
    const raw = Array.isArray(item.tags) ? item.tags.filter(Boolean) as string[] : []
    const others = raw.filter(t => !['low','medium','high'].includes(String(t).toLowerCase()))
    const tags = Array.from(new Set([priority, ...others]))
    update.mutate({ id: item.id, title, notes, tags })
    onClose()
  }

  if (!open) return null

  return (
    <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,.5)', zIndex:50}}>
      <div className="card card-pad" style={{ width: 'min(860px, 92vw)', maxHeight: '86vh', overflow: 'auto', textAlign:'left' }}>
        <div className="card-pad" style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
            <select
              className="select"
              value={priority}
              onChange={e=>setPriority(e.target.value as any)}
              style={
                priority==='high'
                  ? { borderColor: 'rgb(239, 68, 68)', color: 'rgb(239, 68, 68)' }
                  : priority==='medium'
                  ? { borderColor: 'rgb(245, 158, 11)', color: 'rgb(245, 158, 11)' }
                  : { borderColor: 'rgb(34, 197, 94)', color: 'rgb(34, 197, 94)' }
              }
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>

          <div className="card" style={{ padding: '12px 14px' }}>
            <div className="card-title" style={{ marginBottom: 6 }}>Notes (preview)</div>
            <div className="meta" style={{ lineHeight: '22px', whiteSpace: 'pre-wrap' }}>{notes || '—'}</div>
          </div>

          <textarea className="input" placeholder="Notes" rows={10} style={{ width: '100%' }} value={notes} onChange={e=>setNotes(e.target.value)} />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
            <button className="btn btn-danger" onClick={()=>setConfirmDelete(true)}>Delete</button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" onClick={onClose}>Close</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,.5)', zIndex:60}}>
          <div className="card-pad" style={{ width: 420, maxWidth: '92vw', textAlign:'left' }}>
            <h2 style={{margin:0, marginBottom:10}}>Are you sure?</h2>
            <p className="meta" style={{marginTop:0}}>This will permanently delete the card.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={()=>setConfirmDelete(false)}>No</button>
              <button
                className="btn btn-danger"
                onClick={() => { del.mutate(item.id, { onSuccess: onClose }); setConfirmDelete(false) }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
