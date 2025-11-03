import { supabase } from '@/lib/supabase'

type Status = 'todo'|'in_progress'|'blocked'|'done'
type SeedItem = {
  title: string
  status?: Status
  tags?: string[]
  notes: string
}

// Tasks parsed from tasks_for_import.csv
const tasks: SeedItem[] = [
  { title: "Removed", status: "blocked", tags: ["Non-serving keyword"], notes: "Source: Non-serving keyword" },
  { title: "Removed", status: "blocked", tags: ["Non-serving keyword"], notes: "Source: Non-serving keyword" },
  { title: "Removed", status: "blocked", tags: ["Non-serving keyword"], notes: "Source: Non-serving keyword" },
  { title: "Removed", status: "blocked", tags: ["Redundant keyword"], notes: "Source: Redundant keyword" },
  { title: "Removed", status: "blocked", tags: ["Redundant keyword"], notes: "Source: Redundant keyword" },
  { title: "Removed", status: "blocked", tags: ["Redundant keyword"], notes: "Source: Redundant keyword" },
  { title: "Removed", status: "blocked", tags: ["Redundant keyword"], notes: "Source: Redundant keyword" },
  { title: "Removed", status: "blocked", tags: ["Redundant keyword"], notes: "Source: Redundant keyword" },
  { title: "Target ROAS lowering", status: "todo", tags: ["Target ROAS lowering"], notes: "Source: Target ROAS lowering" }
]

export async function getOrCreateDivanProject() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) throw new Error('Not signed in')

  const { data: existing } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.user.id)
    .eq('name', 'Divan Base Direct')
    .maybeSingle()

  if (existing) return existing

  const { data: created, error } = await supabase
    .from('projects')
    .insert([{ name: 'Divan Base Direct', color: 'indigo' }])
    .select('id')
    .single()

  if (error) throw error
  return created
}

export async function seedDivanTasks(projectId: string) {
  const { data: current, error } = await supabase
    .from('items')
    .select('id,title,notes')
    .eq('project_id', projectId)
  if (error) throw error

  const existing = new Map((current || []).map(i => [i.title.trim().toLowerCase(), i]))
  const pos = () => Date.now() + Math.random()
  let inserted = 0, updated = 0

  for (const t of tasks) {
    const key = t.title.trim().toLowerCase()
    const found = existing.get(key)
    if (!found) {
      const { error: insErr } = await supabase.from('items').insert([{
        project_id: projectId,
        title: t.title,
        status: t.status ?? 'todo',
        tags: t.tags ?? [],
        notes: t.notes,
        position: pos()
      }])
      if (insErr) throw insErr
      inserted++
    } else if (!found.notes || found.notes.trim() === '') {
      const { error: upErr } = await supabase.from('items').update({ notes: t.notes }).eq('id', found.id)
      if (upErr) throw upErr
      updated++
    }
  }

  return { inserted, updated }
}
