import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/types'
import { db } from '@/lib/idb'

const key = ['projects']

export function useProjects() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true })
      if (error) throw error
      const _db = await db()
      await _db.put('projects', data, 'all')
      return data as Project[]
    },
    initialData: async () => {
      const _db = await db()
      return (await _db.get('projects', 'all')) as Project[] | undefined
    }
  })
}

async function queue(op: any) {
  const _db = await db()
  const id = crypto.randomUUID()
  await _db.put('mutationQueue', { id, ts: Date.now(), op }, id)
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (draft: Partial<Project>) => {
      if (!navigator.onLine) {
        await queue({ table: 'projects', action: 'insert', payload: draft })
        return draft as Project
      }
      const { data, error } = await supabase.from('projects').insert(draft).select().single()
      if (error) throw error
      return data as Project
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key })
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      if (!navigator.onLine) {
        await queue({ table: 'projects', action: 'delete', payload: { id } })
        return
      }
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key })
  })
}
