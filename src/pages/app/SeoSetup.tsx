import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { seedPlatesExpressSEO } from '@/features/seo/seedPlatesExpress'

export default function SeoSetup() {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const navigate = useNavigate()
  const create = async () => {
    try {
      setBusy(true); setErr(null)
      const project = await seedPlatesExpressSEO()
      navigate(`/app/projects/${project.id}`)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to create checklist')
    } finally { setBusy(false) }
  }
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>SEO Checklist Setup</h1>
      <p>This will create a new project with prefilled tasks.</p>
      <button onClick={create} disabled={busy}>{busy?'Creating…':'Create SEO Checklist'}</button>
      {err && <div style={{color:'red', marginTop:8}}>{err}</div>}
    </div>
  )
}
