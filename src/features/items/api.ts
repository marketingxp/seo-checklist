import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/slug'
import { getNotesTemplateForTitle } from '@/features/seo/seedFromAudit'

export type Item = {
  id: string
  user_id: string
  project_id: string
  title: string
  slug: string | null
  status: 'todo'|'in_progress'|'blocked'|'done'
  notes: string | null
  tags: string[] | null
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
}

const qKey = (projectId: string) => ['items', projectId]

export function useItems(projectId: string) {
  return useQuery({
    queryKey: qKey(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items').select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
      if (error) throw error
      return (data || []) as Item[]
    },
    enabled: !!projectId
  })
}

export function useCreateItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: Partial<Item>) => {
      const title = (input.title || '').trim()
      const slug = slugify(title)
      const notes = (input.notes && input.notes.trim()) ? input.notes : (getNotesTemplateForTitle(title) || '')
      const { data, error } = await supabase
        .from('items')
        .insert([{ project_id: projectId, status: 'todo', tags: [], position: Date.now(), ...input, title, slug, notes }])
        .select('*').single()
      if (error) throw error
      return data as Item
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey(projectId) })
  })
}

export function useUpdateItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<Item> & { id: string }) => {
      const payload = { ...patch } as any
      if (payload.title) payload.slug = slugify(payload.title)
      const { data, error } = await supabase.from('items').update(payload).eq('id', patch.id).select('*').single()
      if (error) throw error
      return data as Item
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: qKey(projectId) })
      const prev = qc.getQueryData<Item[]>(qKey(projectId)) || []
      const optimistic = prev.map(i => i.id === patch.id ? { ...i, ...patch, slug: patch.title ? slugify(patch.title) : i.slug } as Item : i)
      qc.setQueryData(qKey(projectId), optimistic)
      return { prev }
    },
    onError: (_err, _patch, ctx) => { if (ctx?.prev) qc.setQueryData(qKey(projectId), ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: qKey(projectId) })
  })
}

export function useDeleteItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qKey(projectId) })
  })
}
