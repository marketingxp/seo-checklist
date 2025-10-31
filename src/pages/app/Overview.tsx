import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects, useCreateProject } from '@/features/projects/api'

export default function Overview() {
  const { data = [], isLoading, error } = useProjects()
  const create = useCreateProject()
  const [name, setName] = useState('')

  const add = () => {
    const n = name.trim()
    if (!n) return
    create.mutate({ name: n })
    setName('')
  }

  if (error) {
    return <div className="p-6 text-red-600">Failed to load projects.</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-2">
        <input
          className="px-3 py-2 rounded bg-muted w-full max-w-md"
          placeholder="New project name…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          aria-label="New project name"
        />
        <button className="px-3 py-2 rounded bg-sky-600" onClick={add} disabled={create.isPending}>
          Add
        </button>
      </div>

      {isLoading ? (
        <div>Loading…</div>
      ) : data.length === 0 ? (
        <div className="text-muted-foreground">No projects yet — add one above.</div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((p) => (
            <li key={p.id} className="rounded border p-4 hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{p.name}</h3>
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: p.color }} />
              </div>
              <Link className="text-sky-600 underline" to={`/app/projects/${p.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
