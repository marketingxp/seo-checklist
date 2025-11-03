import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import type { Item } from './api'
import { Priority, getPriority, setPriority, prioColors } from './priority'
import { getNotesTemplateForTitle } from '@/features/seo/seedFromAudit'
import { useDeleteItem } from './api'

function md(text: string){
  return (text||'').trim()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br/>')
}

export default function ItemDialog({
  open,
  item,
  projectId,
  onClose,
  onSave
}: {
  open: boolean
  item: Item | null
  projectId: string
  onClose: () => void
  onSave: (patch: Partial<Item> & { id: string }) => void
}){
  const [title,setTitle]=useState(''); const [notes,setNotes]=useState(''); const [prio,setPrio]=useState<Priority>('medium')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const del = useDeleteItem(projectId)

  useEffect(()=>{
    if(!item) return
    setTitle(item.title||'')
    const existing = (item.notes||'').trim()
    if(existing){
      setNotes(existing)
    }else{
      const tpl = getNotesTemplateForTitle(item.title||'')
      setNotes(tpl || '')
    }
    setPrio(getPriority(item.tags))
    setConfirmDelete(false)
  },[item])

  function handleDelete(){
    if(!item) return
    del.mutate(item.id, {
      onSuccess: () => {
        setConfirmDelete(false)
        onClose()
      }
    })
  }

  if(!item) return null
  return (
    <Modal open={open} onClose={onClose}>
      <div className="card-pad" style={{display:'grid',gap:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title"/>
          <select className="select" value={prio} onChange={e=>setPrio(e.target.value as Priority)} style={{borderColor:prioColors[prio],color:prioColors[prio]}}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>

        {notes && (
          <div className="card" style={{padding:'12px 14px'}}>
            <div className="card-title" style={{marginBottom:6}}>Notes (preview)</div>
            <div className="meta" style={{lineHeight:'22px'}} dangerouslySetInnerHTML={{__html:'<p>'+md(notes)+'</p>'}} />
          </div>
        )}

        <textarea className="input" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes" rows={10} style={{width:'100%'}}/>
        <div style={{display:'flex',gap:10,justifyContent:'space-between',alignItems:'center',flexWrap:'wrap'}}>
          {!confirmDelete ? (
            <button className="btn btn-danger" onClick={()=>setConfirmDelete(true)}>Delete</button>
          ) : (
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              <span className="meta">Are you are?</span>
              <button className="btn" onClick={()=>setConfirmDelete(false)} disabled={del.isPending}>No</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={del.isPending}>{del.isPending?'Deleting…':'Yes'}</button>
            </div>
          )}
          <div style={{display:'flex',gap:10}}>
            <button className="btn" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={()=>onSave({id:item.id,title,notes,tags:setPriority(item.tags, prio)})}>Save</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
