import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function AuthGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { supabase.auth.getSession().then(() => setReady(true)) }, [])
  if (!ready) return <div className="p-6">Loading…</div>
  return <>{children}</>
}
