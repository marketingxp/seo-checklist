// src/pages/app/SeedPlatesExpress.tsx
import { useEffect, useState } from 'react'
import { getOrCreatePlatesExpressProject, seedPlatesExpressFromAudit } from '@/features/seo/seedFromAudit'

export default function SeedPlatesExpress() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{inserted:number;updated:number}|null>(null)
  const [error, setError] = useState<string| null>(null)

  async function handleSeed() {
    try {
      setBusy(true); setError(null)
      const proj = await getOrCreatePlatesExpressProject()
      const res  = await seedPlatesExpressFromAudit(proj.id)
      setResult(res)
    } catch (e:any) {
      setError(e?.message || 'Failed to seed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container" style={{maxWidth:900, margin:'40px auto'}}>
      <h1 style={{marginBottom:16}}>Seed Plates Express</h1>
      <p style={{marginBottom:10, color:'#9fadbc'}}>
        Adds/updates the SEO checklist cards (with full Notes) under the “Plates Express” project for the current user.
      </p>
      <button className="btn btn-primary" onClick={handleSeed} disabled={busy}>
        {busy ? 'Seeding…' : 'Seed from Audit'}
      </button>

      {result && (
        <div className="card" style={{marginTop:16}}>
          <div className="card-title">Done</div>
          <div className="meta">Inserted: {result.inserted} • Updated: {result.updated}</div>
        </div>
      )}

      {error && (
        <div className="card" style={{marginTop:16, borderLeft:'4px solid #c9372c'}}>
          <div className="card-title">Error</div>
          <div className="meta">{error}</div>
        </div>
      )}
    </div>
  )
}
