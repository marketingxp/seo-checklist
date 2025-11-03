import { useState } from 'react'
import { getOrCreateDivanProject, seedDivanTasks } from '@/features/seo/seedDivan'

export default function SeedDivan() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSeed() {
    try {
      setBusy(true); setMsg('')
      const proj = await getOrCreateDivanProject()
      const res  = await seedDivanTasks(proj.id)
      setMsg(`Done. Inserted: ${res.inserted}, Updated: ${res.updated}`)
    } catch (e: any) {
      setMsg(e?.message || 'Failed to seed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{maxWidth:900, margin:'40px auto'}}>
      <h1 style={{marginBottom:16}}>Seed: Divan Base Direct</h1>
      <p style={{marginBottom:10, color:'#9fadbc'}}>
        Creates the project and inserts tasks for Divan Base Direct.
      </p>
      <button className="btn btn-primary" onClick={handleSeed} disabled={busy}>
        {busy ? 'Seeding…' : 'Seed Divan'}
      </button>
      {msg && (
        <div className="card" style={{marginTop:16}}>
          <div className="meta">{msg}</div>
        </div>
      )}
    </div>
  )
}
