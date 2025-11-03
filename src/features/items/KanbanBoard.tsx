import { useMemo } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableCard from './SortableCard'
import type { Item } from './api'
import { useUpdateItem } from './api'

type Props = { projectId: string; items: Item[]; onOpen?: (it: Item)=>void }
const COLS: { key: Item['status']; label: string }[] = [
  { key: 'todo', label: 'To-do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'done', label: 'Done' }
]

function nextPosition(targetIndex: number, list: Item[]) {
  if (list.length === 0) return 1000
  if (targetIndex <= 0) return (list[0].position ?? 1000) - 1
  if (targetIndex >= list.length) return (list[list.length-1].position ?? 1000) + 1
  const a = list[targetIndex - 1].position ?? (targetIndex * 1000)
  const b = list[targetIndex].position ?? ((targetIndex+1) * 1000)
  return (a + b) / 2
}

export default function KanbanBoard({ projectId, items, onOpen }: Props) {
  const sensors = useSensors(useSensor(PointerSensor))
  const update = useUpdateItem(projectId)

  const byStatus = useMemo(() => {
    const g: Record<Item['status'], Item[]> = { todo:[], in_progress:[], blocked:[], done:[] }
    for (const it of items) g[it.status].push(it)
    for (const k of Object.keys(g) as Item['status'][]) g[k].sort((a,b)=>(a.position??0)-(b.position??0))
    return g
  }, [items])

  function getContainerOf(id: string) {
    for (const c of COLS) if (byStatus[c.key].some(i => i.id === id)) return c.key
    return undefined
  }

  function handleDragOver(_e: DragOverEvent) {}

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!active?.id || !over?.id) return
    const activeId = String(active.id)
    const overId = String(over.id)

    const fromCol = getContainerOf(activeId)
    const toCol = getContainerOf(overId) || (COLS.find(c => c.key === overId)?.key)
    if (!fromCol || !toCol) return

    const fromList = byStatus[fromCol]
    const toListBase = byStatus[toCol]
    const moving = items.find(i => i.id === activeId)
    if (!moving) return

    const isSameCol = fromCol === toCol
    let newIndex = 0

    if (isSameCol) {
      const overIndex = toListBase.findIndex(i => i.id === overId)
      const actIndex = toListBase.findIndex(i => i.id === activeId)
      if (overIndex < 0 || actIndex < 0) return
      const temp = [...toListBase]
      const [spliced] = temp.splice(actIndex, 1)
      temp.splice(overIndex, 0, spliced)
      newIndex = overIndex
      const pos = nextPosition(newIndex, temp.filter(i => i.id !== activeId ? true : false))
      update.mutate({ id: moving.id, position: pos })
    } else {
      const overIndex = toListBase.findIndex(i => i.id === overId)
      const targetIndex = overIndex >= 0 ? overIndex : toListBase.length
      const pos = nextPosition(targetIndex, toListBase)
      update.mutate({ id: moving.id, status: toCol, position: pos })
    }
  }

  return (
    <DndContext sensors={sensors} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
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
              <SortableContext items={byStatus[c.key].map(i => i.id)} strategy={verticalListSortingStrategy}>
                {byStatus[c.key].map(item => (
                  <SortableCard key={item.id} item={item} projectId={projectId} onOpen={onOpen} />
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
