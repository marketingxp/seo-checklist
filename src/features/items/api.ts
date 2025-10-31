// src/features/items/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Item = {
  id: string
  project_id: string
  title: string
  status: 'todo' | 'in_progress' | 'blocked' | 'done'
  notes: string | null
  tags: string[]
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
  user_id: string
}

const normalize = (row: any): Item => ({
  id: String(row.id),
  project_id: String(row.project_id),
  title: String(row.title ?? ''),
  status: (['todo','in_progress','blocked','done'] as const).includes(row.status) ? row.status : 'todo',
  notes: row.notes ?? null,
  tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
  due_date: row.due_date ?? null,
  position: Number.isFinite(row.position) ? Number(row.position) : Date.now(),
  created_at: String(row.created_at ?? new Date().toISOString()),
  updated_at: String(row.updated_at ?? new Date().toISOString()),
  user_id: String(row.user_id ?? '')
})

export const useItems = (projectId: string) =>
  useQuery({
    queryKey: ['items', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
      if (error) throw error
      const rows = Array.isArray(data) ? data : []
      return rows.map(normalize)
    }
  })

export const useCreateItem = (projectId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (partial: Partial<Item>) => {
      const payload = {
        project_id: projectId,
        title: String(partial.title ?? ''),
        status: partial.status ?? 'todo',
        notes: partial.notes ?? null,
        tags: Array.isArray(partial.tags) ? partial.tags : [],
        due_date: partial.due_date ?? null,
        position: Number.isFinite(partial.position as number) ? partial.position : Date.now()
      }
      const { data, error } = await supabase.from('items').insert(payload).select().single()
      if (error) throw error
      return normalize(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items', projectId] })
  })
}

export const useUpdateItem = (projectId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (update: Partial<Item> & { id: string }) => {
      const { id, ...patch } = update

      // safety: keep patch clean
      const safe: Record<string, any> = { ...patch }
      if ('tags' in safe && !Array.isArray(safe.tags)) delete safe.tags
      if ('position' in safe) {
        const n = Number(safe.position)
        if (!Number.isFinite(n)) delete safe.position
      }

      const { data, error } = await supabase
        .from('items')
        .update(safe)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return normalize(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items', projectId] })
  })
}

export const useDeleteItem = (projectId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('items').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items', projectId] })
  })
}
