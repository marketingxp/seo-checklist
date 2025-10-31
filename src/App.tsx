import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProjectPage from '@/pages/app/ProjectPage'
import Home from '@/pages/public/Home'

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Navigate to="/app/projects/overview" replace />} />
        {/* adjust to your real routes; here’s a simple catch-all */}
        <Route path="/app/projects/:id" element={<ProjectPage />} />
        <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
      </Routes>
    </Suspense>
  )
}
