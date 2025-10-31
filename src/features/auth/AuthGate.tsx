import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navigate } from 'react-router-dom'

export default function AuthGate({children}:{children:React.ReactNode}) {
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setAuthed(!!data.session)
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setAuthed(!!session)
    })
    return () => { sub.subscription.unsubscribe(); mounted = false }
  }, [])

  if (!ready) return <div className="container"><div className="card" style={{padding:12}}>Loading…</div></div>
  if (!authed) return <Navigate to="/login" replace />
  return <>{children}</>
}
