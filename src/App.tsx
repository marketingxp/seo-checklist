import SeedPlatesExpress from '@/pages/app/SeedPlatesExpress'
import { Routes, Route, Navigate } from 'react-router-dom'
import PlatesExpress from '@/pages/app/PlatesExpress'
import Login from '@/features/auth/Login'
import AuthGate from '@/features/auth/AuthGate'

export default function App() {
  return (
    <Routes>
                <Route path="/app/seed-plates-express" element={<SeedPlatesExpress />} />
<Route path="/" element={<Navigate to="/app/plates-express" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/app/plates-express"
        element={
          <AuthGate>
            <PlatesExpress />
          </AuthGate>
        }
      />
      <Route path="*" element={<Navigate to="/app/plates-express" replace />} />
    </Routes>
  )
}
