import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Item } from './api'
import { useUpdateItem } from './api'
import { between } from './dnd'
import ItemCard from './ItemCard'
import StatusBadge from '@/components/StatusBadge'
import { useMemo, useState } from 'react'

type ColKey = Item['status']
const COLS: {key:ColKey; title:string}[] = [
  { key:'todo', title:'To-do' },
  { key:'in_progress', title:'In progress' },
  { key:'blocked', title:'Blocked' },
  { key:'done', title:'Done' }
]

function SortableCard({item}:{item:Item}){
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id:item.id})
  const style = { transform: CSS.Transform.toString(transform), transition, cursor:'grab' as const }
  return (
    <div ref={setNodeRef} style={style} className={isDragging?'dragging':''} {...attributes} {...listeners}>
      <ItemCard item={item}/>
    </div>
  )
}

export default function KanbanBoard({ projectId, items }: { projectId: string; items: Item[] }) {
  const update = useUpdateItem(projectId)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:6 }}))
  const [activeId, setActiveId] = useState<string | null>(null)

  const byCol = useMemo(() => {
    const m: Record<ColKey, Item[]> = { todo:[], in_progress:[], blocked:[], done:[] }
    ;(items||[]).slice().sort((a,b)=>a.position-b.position).forEach(i=>m[i.status].push(i))
    return m
  }, [items])

  const allIds = useMemo(()=>items.map(i=>i.id),[items])
  const activeItem = activeId ? items.find(i=>i.id===activeId) || null : null

  function getColumnOf(id:string|undefined|null): ColKey | null {
    if(!id) return null
    const found = items.find(i=>i.id===id)
    return found ? found.status : null
  }

  function handleDragStart(e:any){ setActiveId(String(e.active.id)) }

  function handleDragOver(){}

  function handleDragEnd(e:any){
    const {active, over} = e
    setActiveId(null)
    if(!over) return
    const draggedId = String(active.id)
    const overId = String(over.id)
    const sourceCol = getColumnOf(draggedId)
    const destCol = getColumnOf(overId) ?? (COLS.map(c=>c.key).includes(overId as ColKey) ? overId as ColKey : null)
    if(!sourceCol) return
    let targetCol: ColKey = destCol || sourceCol

    if(allIds.includes(overId)){
      const destList = byCol[targetCol]
      const overIndex = destList.findIndex(i=>i.id===overId)
      const before = destList[overIndex-1]?.position ?? null
      const after = destList[overIndex]?.position ?? null
      const newPos = between(before, after)
      if(newPos==null) return
      update.mutate({ id: draggedId, status: targetCol, position: newPos })
      return
    }

    if(COLS.some(c=>c.key===overId as ColKey)){
      const destList = byCol[overId as ColKey]
      const before = destList.length ? destList[destList.length-1].position : null
      const after = null
      const newPos = between(before, after)
      update.mutate({ id: draggedId, status: overId as ColKey, position: newPos })
    }
  }

  return (
    <div className="board-wrap">
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="board">
          {COLS.map(col=>{
            const list = byCol[col.key]
            return (
              <div key={col.key} className="column" id={col.key}>
                <div className="column-head">
                  <div className="column-title">
                    <StatusBadge status={col.key}/>
                    <div>{col.title}</div>
                  </div>
                  <div className="column-count">{list.length}</div>
                </div>
                <div className="column-scroller">
                  <SortableContext items={list.map(i=>i.id)} strategy={verticalListSortingStrategy}>
                    {list.map(i=> <SortableCard key={i.id} item={i}/>)}
                    {list.length===0 && <div className="card">Empty</div>}
                    <div className="drop-indicator" />
                  </SortableContext>
                </div>
              </div>
            )
          })}
        </div>
        <DragOverlay>{activeItem ? <ItemCard item={activeItem}/> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}
