import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Item = {
  id: string
  project_id: string
  title: string
  status: 'todo'|'in_progress'|'blocked'|'done'
  notes: string | null
  tags: string[] | null
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
  user_id: string
}

export function useItems(projectId: string) {
  return useQuery({
    queryKey: ['items', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
      if (error) throw error
      return (data ?? []) as Item[]
    },
    enabled: !!projectId
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
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['items', projectId] })
      const prev = qc.getQueryData<Item[]>(['items', projectId]) || []
      qc.setQueryData<Item[]>(['items', projectId], prev.filter(i => i.id !== id))
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['items', projectId], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['items', projectId] })
    }
  })
}

export function useCreateItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Item>) => {
      const { data, error } = await supabase.from('items').insert([{ ...payload, project_id: projectId }]).select('*').single()
      if (error) throw error
      return data as Item
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items', projectId] })
    }
  })
}

export function useUpdateItem(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<Item> & { id: string }) => {
      const { id, ...rest } = patch
      const { data, error } = await supabase.from('items').update(rest).eq('id', id).select('*').single()
      if (error) throw error
      return data as Item
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items', projectId] })
    }
  })
}
