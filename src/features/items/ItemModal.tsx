import { useState } from 'react'
import Confirm from '@/components/Confirm'
import { useDeleteItem, useUpdateItem, Item } from './api'

export default function ItemModal({ open, onClose, projectId, item }: { open: boolean; onClose: () => void; projectId: string; item: Item }) {
  const [title, setTitle] = useState(item.title)
  const [notes, setNotes] = useState(item.notes ?? '')
  const [showConfirm, setShowConfirm] = useState(false)
  const update = useUpdateItem(projectId)
  const del = useDeleteItem(projectId)

  function save() {
    update.mutate({ id: item.id, title, notes })
    onClose()
  }

  function requestDelete() {
    setShowConfirm(true)
  }

  function confirmDelete() {
    setShowConfirm(false)
    del.mutate(item.id, { onSuccess: onClose })
  }

  function cancelDelete() {
    setShowConfirm(false)
  }

  if (!open) return null
  return (
    <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,.5)', zIndex:40}}>
      <div className="card-pad" style={{width: 560, maxWidth: '94vw'}}>
        <h2 style={{marginTop:0}}>Edit card</h2>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={{marginBottom:8}} />
        <textarea className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes" />
        <div style={{display:'flex', gap:8, justifyContent:'space-between', marginTop:12}}>
          <button className="btn btn-danger" onClick={requestDelete}>Delete</button>
          <div style={{display:'flex', gap:8}}>
            <button className="btn" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </div>
      </div>
      <Confirm
        open={showConfirm}
        title="Are you sure?"
        message="This will permanently delete the card."
        onYes={confirmDelete}
        onNo={cancelDelete}
      />
    </div>
  )
}
