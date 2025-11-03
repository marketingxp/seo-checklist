import { useEffect, useMemo, useState } from 'react'
import { useItems, useCreateItem } from '@/features/items/api'
import KanbanBoard from '@/features/items/KanbanBoard'
import { getOrCreatePlatesExpressProject, seedPlatesExpressFromAudit } from '@/features/seo/seedFromAudit'
import { supabase } from '@/lib/supabase'

export default function PlatesExpress() {
  const [projectId, setProjectId] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { data } = useItems(projectId)
  const items = useMemo(() => Array.isArray(data) ? data : [], [data])
  const create = useCreateItem(projectId)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try { const p = await getOrCreatePlatesExpressProject(); if(mounted) setProjectId(p.id) }
      catch (e: any) { setErr(e?.message ?? 'Failed to init project') }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (!projectId) return
    const ch = supabase.channel(`items-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `project_id=eq.${projectId}` }, () => location.reload())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [projectId])

  const add = () => {
    const t = title.trim()
    const cat = category.trim()
    if (!t || !projectId) return
    const tags = cat ? [cat] : []
    create.mutate({ title: t, status: 'todo', tags, position: Date.now() })
    setTitle('')
    setCategory('')
  }

  const seed = async () => {
    try { setBusy(true); setErr(null); const res = await seedPlatesExpressFromAudit(projectId); if(res.inserted===0) setErr('Tasks already present') }
    catch (e: any) { setErr(e?.message ?? 'Failed to seed tasks') }
    finally { setBusy(false) }
  }

  return (
    <>
      <div className="header">
        <div className="header-inner">
          <div className="brand">Plates Express</div>
          <div className="kicker">SEO Checklist</div>
        </div>
      </div>
      <div className="container">
        <div className="toolbar">
          <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add item…" onKeyDown={e=>e.key==='Enter'&&add()} />
          <input className="input" value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category badge (optional)" onKeyDown={e=>e.key==='Enter'&&add()} />
          <button className="btn btn-primary" onClick={add}>Add</button>
          <button className="btn" onClick={seed} disabled={busy}>{busy?'Seeding…':'Seed from Audit'}</button>
        </div>
        {err && <div className="card" style={{padding:12,borderColor:'rgba(239,68,68,.35)'}}>{err}</div>}
        {!projectId && <div className="card" style={{padding:12}}>Loading…</div>}
        {projectId && <KanbanBoard projectId={projectId} items={items} />}
      </div>
    </>
  )
}

// --- add near your imports ---
// import { clearPlatesExpressItems } from '@/features/seo/reset'
// import { seedPlatesExpressFromAudit, getOrCreatePlatesExpressProject } from '@/features/seo/seedFromAudit'

// --- somewhere in the component toolbar ---
/*
<button className="btn btn-danger" onClick={async ()=>{
  const { deleted } = await clearPlatesExpressItems()
  const proj = await getOrCreatePlatesExpressProject()
  const res = await seedPlatesExpressFromAudit(proj.id)
  alert(`Reset complete. Inserted: ${res.inserted}, Updated: ${res.updated}`)
}}>
  Reset & Reseed
</button>
*/
