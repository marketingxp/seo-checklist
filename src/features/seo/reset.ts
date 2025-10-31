import { supabase } from '@/lib/supabase'

export async function clearPlatesExpressItems() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) throw new Error('Not signed in')

  const { data: proj, error: perr } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('name','Plates Express')
    .maybeSingle()
  if (perr) throw perr
  if (!proj) return { deleted: 0 }

  const { error: derr } = await supabase
    .from('items')
    .delete()
    .eq('project_id', proj.id)
  if (derr) throw derr

  return { deleted: 'ok' }
}
