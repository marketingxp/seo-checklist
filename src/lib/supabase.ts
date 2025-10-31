import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!url || !anon) {
  const msg = 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
  console.error(msg)
  // show a visible error instead of a blank page
  const el = document.getElementById('root')
  if (el) el.innerHTML = `<div style="padding:24px;font-family:system-ui"><h1>Config error</h1><p>${msg}</p></div>`
  throw new Error(msg)
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true }
})
