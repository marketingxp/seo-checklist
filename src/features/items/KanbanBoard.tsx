import { useMemo } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableCard from './SortableCard'
import type { Item } from './api'
import { useUpdateItem } from './api'

type Status = 'todo' | 'in_progress' | 'blocked' | 'done'
const COLS: { key: Status; label: string }[] = [
  { key: 'todo',        label: 'To-do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'blocked',     label: 'Blocked' },
  { key: 'done',        label: 'Done' }
]

function safeStatus(val: any): Status {
  const v = String(val || '').toLowerCase()
  if (v === 'in_progress') return 'in_progress'
  if (v === 'blocked') return 'blocked'
  if (v === 'done') return 'done'
  return 'todo'
}

function nextPosition(targetIndex: number, list: Item[]) {
  if (list.length === 0) return 1000
  if (targetIndex <= 0) return (list[0].position ?? 1000) - 1
  if (targetIndex >= list.length) return (list[list.length - 1].position ?? 1000) + 1
  const a = list[targetIndex - 1].position ?? (targetIndex * 1000)
  const b = list[targetIndex].position ?? ((targetIndex + 1) * 1000)
  return (a + b) / 2
}

export default function KanbanBoard({
  projectId,
  items,
  onOpen
}: { projectId: string; items: Item[]; onOpen?: (it: Item)=>void }) {
  const sensors = useSensors(useSensor(PointerSensor))
  const update = useUpdateItem(projectId)

  const byStatus = useMemo(() => {
    const buckets: Record<Status, Item[]> = { todo: [], in_progress: [], blocked: [], done: [] }
    for (const it of Array.isArray(items) ? items : []) {
      const s = safeStatus((it as any).status)
      ;(buckets[s] ?? (buckets[s] = [])).push(it)
    }
    (Object.keys(buckets) as Status[]).forEach(k => buckets[k].sort((a,b)=>(a.position ?? 0) - (b.position ?? 0)))
    return buckets
  }, [items])

  function containerOf(id: string): Status | undefined {
    for (const c of COLS) if (byStatus[c.key].some(i => String(i.id) === id)) return c.key
    return undefined
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!active?.id || !over?.id) return
    const activeId = String(active.id)
    const overId   = String(over.id)

    const from = containerOf(activeId)
    const to = containerOf(overId) ?? (COLS.find(c => c.key === (overId as Status))?.key)
    if (!from || !to) return

    const moving = (Array.isArray(items) ? items : []).find(i => String(i.id) === activeId)
    if (!moving) return

    const toList = byStatus[to]
    const overIndex = toList.findIndex(i => String(i.id) === overId)
    const targetIndex = overIndex >= 0 ? overIndex : toList.length
    const pos = nextPosition(targetIndex, toList)

    update.mutate({ id: moving.id, status: to, position: pos })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="board">
        {COLS.map(c => (
          <div key={c.key} className="column">
            <div className="column-head">
              <div className="column-title">
                <div>{c.label}</div>
                <span className="column-count">{byStatus[c.key].length}</span>
              </div>
            </div>
            <div className="column-scroller" id={c.key}>
              <SortableContext items={byStatus[c.key].map(i => String(i.id))} strategy={verticalListSortingStrategy}>
                {byStatus[c.key].map(item => (
                  <SortableCard key={String(item.id)} item={item} projectId={projectId} onOpen={onOpen} />
                ))}
              </SortableContext>
              {byStatus[c.key].length === 0 && <div className="card">No cards</div>}
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  )
}
