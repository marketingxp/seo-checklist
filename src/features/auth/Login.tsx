import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMsg(error ? error.message : 'Logged in!')
    if (!error) window.location.href = '/app'
  }

  async function onMagic() {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + '/app' } })
    setMsg(error ? error.message : 'Magic link sent!')
  }

  async function onSignup() {
    const { error } = await supabase.auth.signUp({ email, password })
    setMsg(error ? error.message : 'Check your email to confirm.')
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form className="space-y-2" onSubmit={onEmailLogin}>
        <input className="w-full px-3 py-2 rounded bg-muted" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full px-3 py-2 rounded bg-muted" placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="px-4 py-2 rounded bg-sky-600" type="submit">Sign in</button>
      </form>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded bg-zinc-700" onClick={onMagic}>Magic link</button>
        <button className="px-3 py-2 rounded bg-zinc-700" onClick={onSignup}>Create account</button>
      </div>
      {msg && <p className="text-sm opacity-80">{msg}</p>}
    </div>
  )
}
