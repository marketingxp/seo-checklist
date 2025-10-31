import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState<string|null>(null)

  async function send() {
    setErr(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/app/plates-express` }
    })
    if (error) setErr(error.message)
    else setSent(true)
  }

  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#101204'}}>
      <div style={{width:360}} className="card">
        <div className="card-title">Sign in</div>
        <div style={{display:'grid',gap:10}}>
          <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn btn-primary" onClick={send}>Send magic link</button>
          {sent && <div className="meta">Check your email for a sign-in link.</div>}
          {err && <div className="meta" style={{color:'#ef4444'}}>{err}</div>}
        </div>
      </div>
    </div>
  )
}
