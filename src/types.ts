export type Status = 'todo'|'in_progress'|'blocked'|'done'

export type Project = {
  id: string
  user_id: string
  name: string
  color?: string
  created_at?: string
  updated_at?: string
}

export type Item = {
  id: string
  user_id: string
  project_id: string
  title: string
  status: Status
  notes?: string
  tags: string[]
  due_date?: string
  position: number
  created_at?: string
  updated_at?: string
}
