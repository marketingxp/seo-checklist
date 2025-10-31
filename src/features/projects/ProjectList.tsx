import { useProjects, useCreateProject, useDeleteProject } from './api'
import { useState } from 'react'

export default function ProjectList() {
  const { data } = useProjects()
  const create = useCreateProject()
  const del = useDeleteProject()
  const [name, setName] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="px-3 py-2 rounded bg-muted" placeholder="New project…" value={name} onChange={e=>setName(e.target.value)} />
        <button className="px-4 py-2 rounded bg-sky-600" onClick={()=>{ if (!name) return; create.mutate({ name }); setName('') }}>Create</button>
      </div>
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data ?? []).map(p => (
          <li key={p.id} className="rounded border border-border p-4">
            <a className="text-lg font-semibold" href={`/app/p/${p.id}`}>{p.name}</a>
            <div className="mt-3 flex gap-2">
              <button className="px-2 py-1 rounded bg-rose-700" onClick={()=>del.mutate(p.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
