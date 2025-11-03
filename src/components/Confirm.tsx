import { useEffect } from 'react'

type Props = {
  open: boolean
  title?: string
  message?: string
  onYes: () => void
  onNo: () => void
}
export default function Confirm({ open, title = 'Are you sure?', message = 'This will delete the card.', onYes, onNo }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') onNo()
      if (e.key.toLowerCase() === 'y') onYes()
      if (e.key.toLowerCase() === 'n') onNo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onYes, onNo])

  if (!open) return null
  return (
    <div style={{position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,.5)', zIndex:50}}>
      <div className="card-pad" style={{width: 420, maxWidth: '92vw'}}>
        <h2 style={{margin:0, marginBottom:10}}>{title}</h2>
        <p style={{marginTop:0, color:'var(--text-secondary)'}}>{message}</p>
        <div style={{display:'flex', gap:8, justifyContent:'flex-end'}}>
          <button className="btn" onClick={onNo}>No</button>
          <button className="btn btn-danger" onClick={onYes}>Yes</button>
        </div>
      </div>
    </div>
  )
}
