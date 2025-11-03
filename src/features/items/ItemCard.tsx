import { useState } from 'react'
import { Item, useDeleteItem } from './api'

export default function ItemCard({
  item,
  projectId,
  onOpen
}: {
  item: Item
  projectId: string
  onOpen?: (it: Item) => void
}) {
  const [ask, setAsk] = useState(false)
  const del = useDeleteItem(projectId)

  function open() {
    if (onOpen) onOpen(item)
  }
  function requestDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setAsk(true)
  }
  function cancel() {
    setAsk(false)
  }
  function confirm() {
    del.mutate(item.id)
    setAsk(false)
  }

  return (
    <>
      <div className="card" onClick={open}>
        <div className="card-title" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8}}>
          <span>{item.title}</span>
          <button className="btn btn-danger" style={{padding:'4px 8px', fontSize:12}} onClick={requestDelete}>Delete</button>
        </div>
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="card-tags">
            {item.tags.map((t, i) => (
              <span key={i} className="badge">{t}</span>
            ))}
          </div>
        )}
      </div>

      {ask && (
        <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,.5)', zIndex:60}}>
          <div className="card-pad" style={{ width: 420, maxWidth: '92vw' }}>
            <h2 style={{margin:0, marginBottom:10}}>Are you sure?</h2>
            <p className="meta" style={{marginTop:0}}>This will permanently delete the card.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={cancel}>No</button>
              <button className="btn btn-danger" onClick={confirm}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
