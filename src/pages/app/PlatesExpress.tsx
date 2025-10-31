import { useEffect, useMemo, useState } from 'react'
import { useItems, useCreateItem } from '@/features/items/api'
import ItemList from '@/features/items/ItemList'
import KanbanBoard from '@/features/items/KanbanBoard'
import { getOrCreatePlatesExpressProject, seedPlatesExpressFromAudit } from '@/features/seo/seedFromAudit'
import { supabase } from '@/lib/supabase'

export default function PlatesExpress() {
  const [projectId, setProjectId] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // ensure project exists, then load
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const p = await getOrCreatePlatesExpressProject()
        if (!mounted) return
        setProjectId(p.id)
      } catch (e: any) {
        setErr(e?.message ?? 'Failed to init project')
      }
    })()
    return () => { mounted = false }
  }, [])

  // realtime: reflect changes instantly within this project
  useEffect(() => {
    if (!projectId) return
    const ch = supabase.channel(`items-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: `project_id=eq.${projectId}` },
        () => { /* invalidate via tab refresh approach; simple for MVP */ location.reload() })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [projectId])

  const { data } = useItems(projectId)
  const items = useMemo(() => Array.isArray(data) ? data : [], [data])
  const create = useCreateItem(projectId)
  const [title, setTitle] = useState('')

  const add = () => {
    const t = title.trim()
    if (!t || !projectId) return
    create.mutate({ title: t, status: 'todo', tags: [], position: Date.now() })
    setTitle('')
  }

  const seed = async () => {
    try {
      setBusy(true); setErr(null)
      const res = await seedPlatesExpressFromAudit(projectId)
      if (res.inserted === 0) setErr('Tasks already present (nothing new to add).')
      else setErr(null)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to seed tasks')
    } finally { setBusy(false) }
  }

  if (err) return <div style={{ padding:24, fontFamily:'system-ui', color:'red' }}>{err}</div>
  if (!projectId) return <div style={{ padding:24, fontFamily:'system-ui' }}>Loading Plates Express…</div>

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: 12 }}>Plates Express — SEO Checklist</h1>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        <input
          value={title}
          onChange={e=>setTitle(e.target.value)}
          placeholder="Add item…"
          onKeyDown={e=>e.key==='Enter' && add()}
        />
        <button onClick={add}>Add</button>
        <button onClick={seed} disabled={busy}>{busy ? 'Seeding…' : 'Seed from Audit'}</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
        <div>
          <h3>List</h3>
          <ItemList projectId={projectId} items={items} />
        </div>
        <div>
          <h3>Board</h3>
          <KanbanBoard projectId={projectId} items={items} />
        </div>
      </div>
    </div>
  )
}
