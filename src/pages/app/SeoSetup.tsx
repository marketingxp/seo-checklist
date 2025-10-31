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
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-3">SEO Checklist Setup</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Create a project pre-populated with launch-critical SEO tasks (statuses, tags, due dates).
      </p>
      <button
        className="px-4 py-2 rounded bg-sky-600 text-white disabled:opacity-60"
        onClick={create}
        disabled={busy}
      >
        {busy ? 'Creating…' : 'Create SEO Checklist'}
      </button>
      {err && <div className="mt-3 text-red-600">{err}</div>}
    </div>
  )
}
