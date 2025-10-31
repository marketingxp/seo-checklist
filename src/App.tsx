import { Routes, Route, Navigate } from 'react-router-dom'
import PlatesExpress from '@/pages/app/PlatesExpress'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/plates-express" replace />} />
      <Route path="/app" element={<Navigate to="/app/plates-express" replace />} />
      <Route path="/app/plates-express" element={<PlatesExpress />} />
      <Route path="*" element={<div style={{padding:24,fontFamily:'system-ui'}}>Not found</div>} />
    </Routes>
  )
}
