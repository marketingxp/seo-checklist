import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '@/pages/public/Home'
import Overview from '@/pages/app/Overview'
import ProjectPage from '@/pages/app/ProjectPage'
import SeoSetup from '@/pages/app/SeoSetup'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<Navigate to="/app/projects/overview" replace />} />
      <Route path="/app/projects/overview" element={<Overview />} />
      <Route path="/app/projects/:id" element={<ProjectPage />} />
      <Route path="/app/seo/setup" element={<SeoSetup />} />
      <Route path="*" element={<div style={{padding:24}}>Not found</div>} />
    </Routes>
  )
}
