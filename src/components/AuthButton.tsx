import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthButton() {
  const [email,setEmail]=useState<string|null>(null)
  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setEmail(data.user?.email||null)) },[])
  async function signOut(){ await supabase.auth.signOut(); location.href='/login' }
  return email
    ? <button className="btn btn-ghost" onClick={signOut}>Sign out ({email})</button>
    : <a className="btn btn-ghost" href="/login">Sign in</a>
}
