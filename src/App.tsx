import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query'
import { AuthGate } from '@/features/auth/AuthGate'
import Login from '@/features/auth/Login'
import Dashboard from '@/pages/app/Dashboard'
import ProjectPage from '@/pages/app/ProjectPage'
import Home from '@/pages/public/Home'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useOfflineQueue } from '@/hooks/useOfflineQueue'

export default function App() {
  useOfflineQueue()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => setAuthed(!!sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<AuthGate>{authed ? <Dashboard/> : <Navigate to="/login" />}</AuthGate>} />
          <Route path="/app/p/:id" element={<AuthGate>{authed ? <ProjectPage/> : <Navigate to="/login" />}</AuthGate>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
