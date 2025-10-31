import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type Project = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

const normalize = (row: any): Project => ({
  id: String(row.id),
  user_id: String(row.user_id ?? ''),
  name: String(row.name ?? ''),
  color: String(row.color ?? '#0EA5E9'),
  created_at: String(row.created_at ?? new Date().toISOString()),
  updated_at: String(row.updated_at ?? new Date().toISOString())
})

export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return (Array.isArray(data) ? data : []).map(normalize)
    }
  })

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; color?: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name: input.name, color: input.color ?? '#0EA5E9' })
        .select()
        .single()
      if (error) throw error
      return normalize(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] })
  })
}
