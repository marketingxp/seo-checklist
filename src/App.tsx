import SeoSetup from "@/pages/app/SeoSetup"
import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Overview from '@/pages/app/Overview'
import ProjectPage from '@/pages/app/ProjectPage'

function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome</h1>
      <p><a href="/app/projects/overview" className="text-sky-600 underline">Go to app</a></p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <Routes>
          <Route path="/app/seo/setup" element={<SeoSetup />} />
<Route path="/" element={<Home />} />
        {/* /app redirects to overview */}
        <Route path="/app" element={<Navigate to="/app/projects/overview" replace />} />
        {/* Overview list */}
        <Route path="/app/projects/overview" element={<Overview />} />
        {/* Individual project */}
        <Route path="/app/projects/:id" element={<ProjectPage />} />
        <Route path="*" element={<div style={{ padding: 24 }}>Not found</div>} />
      </Routes>
    </Suspense>
  )
}
