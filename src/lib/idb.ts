import { openDB, DBSchema } from 'idb'

interface ChecklistDB extends DBSchema {
  projects: { key: string; value: any }
  items: { key: string; value: any }
  mutationQueue: { key: string; value: { id: string; ts: number; op: any } }
}

export async function db() {
  return openDB<ChecklistDB>('checklist-db', 1, {
    upgrade(db) {
      db.createObjectStore('projects')
      db.createObjectStore('items')
      db.createObjectStore('mutationQueue')
    }
  })
}
