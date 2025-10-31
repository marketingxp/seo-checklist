import { useEffect } from 'react'
import { db } from '@/lib/idb'
import { supabase } from '@/lib/supabase'

type Mutation = { id: string; ts: number; op: any }

export function useOfflineQueue() {
  useEffect(() => {
    const handler = async () => {
      if (!navigator.onLine) return
      const _db = await db()
      const tx = _db.transaction('mutationQueue', 'readwrite')
      const all: Mutation[] = []
      let cursor = await tx.store.openCursor()
      while (cursor) {
        all.push(cursor.value as Mutation)
        cursor = await cursor.continue()
      }
      all.sort((a,b) => a.ts - b.ts)
      for (const m of all) {
        try {
          // naive router: pass {table, action, payload}
          const { table, action, payload } = m.op
          if (table === 'projects') {
            if (action === 'insert') await supabase.from('projects').insert(payload)
            if (action === 'update') await supabase.from('projects').update(payload).eq('id', payload.id)
            if (action === 'delete') await supabase.from('projects').delete().eq('id', payload.id)
          } else if (table === 'items') {
            if (action === 'insert') await supabase.from('items').insert(payload)
            if (action === 'update') await supabase.from('items').update(payload).eq('id', payload.id)
            if (action === 'delete') await supabase.from('items').delete().eq('id', payload.id)
          }
          await tx.store.delete(m.id)
        } catch (e) {
          console.warn('sync error', e)
        }
      }
      await tx.done
    }
    window.addEventListener('online', handler)
    handler()
    return () => window.removeEventListener('online', handler)
  }, [])
}
