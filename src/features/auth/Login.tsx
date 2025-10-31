import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [err, setErr] = useState<string|null>(null)
  const [busy, setBusy] = useState(false)

  async function submit() {
    setErr(null); setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        location.href = '/app/plates-express'
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data.session) location.href = '/app/plates-express'
      }
    } catch (e:any) {
      setErr(e.message || 'Auth failed')
    } finally { setBusy(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#101204'}}>
      <div style={{width:360}} className="card">
        <div className="card-pad">
          <div style={{display:'grid',gap:10}}>
            <div className="card-title">{mode==='signin'?'Sign in':'Create account'}</div>
            <input className="input" type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} />
            <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy?'Working…':(mode==='signin'?'Sign in':'Sign up')}</button>
            <button className="btn btn-ghost" onClick={()=>setMode(mode==='signin'?'signup':'signin')}>
              {mode==='signin'?'Need an account? Sign up':'Have an account? Sign in'}
            </button>
            {err && <div className="meta" style={{color:'#ef4444'}}>{err}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
