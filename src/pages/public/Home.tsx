import { Link } from 'react-router-dom'
export default function Home() {
  return (
    <div className="p-10 text-center space-y-6">
      <h1 className="text-4xl font-bold">Checklist</h1>
      <p className="opacity-80">Fast, responsive checklists with realtime sync & offline support.</p>
      <Link className="px-4 py-2 rounded bg-sky-600" to="/app">Open App</Link>
    </div>
  )
}
