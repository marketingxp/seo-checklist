import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MigratePriorities() {
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    try {
      setBusy(true); setMsg('')
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (!user) { setMsg('Please sign in first'); return }

      // 1) Load current user’s items
      const { data: items, error } = await supabase
        .from('items')
        .select('id,tags')
        .eq('user_id', user.id)
      if (error) throw error

      // 2) Transform tags in JS
      const toNew = (t: string) => {
        const v = t.toLowerCase()
        if (v.startsWith('p0')) return 'High'
        if (v.startsWith('p1')) return 'Medium'
        if (v.startsWith('p2')) return 'Low'
        return t
      }

      let updated = 0
      for (const it of items ?? []) {
        const newTags = (it.tags ?? []).map(toNew)
        const changed = JSON.stringify(newTags) !== JSON.stringify(it.tags ?? [])
        if (changed) {
          const { error: upErr } = await supabase.from('items').update({ tags: newTags }).eq('id', it.id)
          if (upErr) throw upErr
          updated++
        }
      }

      setMsg(`Migration complete. Updated ${updated} item(s).`)
    } catch (e: any) {
      setMsg(e?.message || 'Migration failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{maxWidth:800, margin:'40px auto'}}>
      <h1 style={{marginBottom:12}}>Migrate Priorities P0/P1/P2 → High/Medium/Low</h1>
      <p style={{color:'#9fadbc', marginBottom:12}}>Updates your items in-place, respecting RLS.</p>
      <button className="btn btn-primary" onClick={run} disabled={busy}>
        {busy ? 'Migrating…' : 'Run Migration'}
      </button>
      {msg && <div className="card" style={{marginTop:16}}><div className="meta">{msg}</div></div>}
    </div>
  )
}
