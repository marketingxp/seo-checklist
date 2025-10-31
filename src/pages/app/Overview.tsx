import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProjects, useCreateProject } from '@/features/projects/api'

export default function Overview() {
  const { data = [], isLoading, error } = useProjects()
  const create = useCreateProject()
  const [name, setName] = useState('Plates Express')

  const add = () => {
    const n = name.trim()
    if (!n) return
    create.mutate({ name: n })
    setName('')
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h2>Projects</h2>
      <div style={{ margin: '12px 0' }}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New project name…" />
        <button onClick={add} disabled={create.isPending} style={{ marginLeft: 8 }}>Add</button>
      </div>
      {error && <div style={{ color: 'red' }}>Failed to load projects</div>}
      {isLoading ? <div>Loading…</div> : (
        <ul>
          {data.map(p => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <b>{p.name}</b> &nbsp;
              <Link to={`/app/projects/${p.id}`}>Open</Link>
            </li>
          ))}
          {data.length === 0 && <li>No projects yet — add one above.</li>}
        </ul>
      )}
    </div>
  )
}
