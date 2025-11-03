import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners, Over } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Item } from './api'
import { useUpdateItem } from './api'
import { between } from './dnd'
import ItemCard from './ItemCard'
import ItemDialog from './ItemDialog'
import StatusBadge from '@/components/StatusBadge'
import { useMemo, useState } from 'react'

type ColKey = Item['status']
const COLS: {key:ColKey; title:string}[] = [
  { key:'todo', title:'To-do' },
  { key:'in_progress', title:'In progress' },
  { key:'blocked', title:'Blocked' },
  { key:'done', title:'Done' }
]

function SortableCard({item,onOpen}:{item:Item;onOpen:()=>void}){
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id:item.id})
  const style = { transform: CSS.Transform.toString(transform), transition, cursor:'grab' as const }
  return (
    <div ref={setNodeRef} style={style} className={isDragging?'dragging':''} {...attributes} {...listeners}>
      <ItemCard item={item} onOpen={onOpen} projectId={projectId} />
    </div>
  )
}

function ColumnDroppable({id,children}:{id:ColKey;children:React.ReactNode}){
  const {setNodeRef, isOver} = useDroppable({id})
  return (
    <div ref={setNodeRef} className="column" id={id} style={isOver?{outline:'2px dashed rgba(96,165,250,.5)'}:undefined}>
      {children}
    </div>
  )
}

export default function KanbanBoard({ projectId, items }: { projectId: string; items: Item[] }) {
  const update = useUpdateItem(projectId)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:6 }}))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [openItem, setOpenItem] = useState<Item|null>(null)

  const byCol = useMemo(() => {
    const m: Record<ColKey, Item[]> = { todo:[], in_progress:[], blocked:[], done:[] }
    ;(items||[]).slice().sort((a,b)=>a.position-b.position).forEach(i=>m[i.status].push(i))
    return m
  }, [items])

  const ids = useMemo(()=>items.map(i=>i.id),[items])
  const activeItem = activeId ? items.find(i=>i.id===activeId) || null : null

  function colOf(id:string|undefined|null): ColKey | null {
    if(!id) return null
    const found = items.find(i=>i.id===id)
    return found ? found.status : null
  }

  function endAt(over: Over | null | undefined){
    if(!over) return null
    const oid = String(over.id)
    const inCol = (COLS.find(c=>c.key===oid)?.key) as ColKey | undefined
    return inCol ?? null
  }

  function handleDragStart(e:any){ setActiveId(String(e.active.id)) }

  function handleDragEnd(e:any){
    const {active, over} = e
    setActiveId(null)
    if(!over) return
    const draggedId = String(active.id)
    const overId = String(over.id)

    const fromCol = colOf(draggedId)
    const overIsItem = ids.includes(overId)
    const toCol = overIsItem ? (colOf(overId) as ColKey) : (endAt(over) ?? fromCol)
    if(!fromCol || !toCol) return

    if(overIsItem){
      const list = byCol[toCol]
      const idx = list.findIndex(i=>i.id===overId)
      const before = list[idx-1]?.position ?? null
      const after = list[idx]?.position ?? null
      const pos = between(before, after)
      update.mutate({ id: draggedId, status: toCol, position: pos })
      return
    }

    const list = byCol[toCol]
    const before = list.length ? list[list.length-1].position : null
    const pos = between(before, null)
    update.mutate({ id: draggedId, status: toCol, position: pos })
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="board">
          {COLS.map(col=>{
            const list = byCol[col.key]
            return (
              <ColumnDroppable key={col.key} id={col.key}>
                <div className="column-head">
                  <div className="column-title">
                    <StatusBadge status={col.key}/>
                    <div>{col.title}</div>
                  </div>
                  <div className="column-count">{list.length}</div>
                </div>
                <div className="column-scroller">
                  <SortableContext items={list.map(i=>i.id)} strategy={verticalListSortingStrategy}>
                    {list.map(i=> <SortableCard key={i.id} item={i} onOpen={()=>setOpenItem(i)}/>)}
                    {list.length===0 && <div className="card">Empty</div>}
                    <div className="drop-indicator" />
                  </SortableContext>
                </div>
              </ColumnDroppable>
            )
          })}
        </div>
        <DragOverlay>{activeItem ? <ItemCard item={activeItem} projectId={projectId} /> : null}</DragOverlay>
      </DndContext>

      <ItemDialog
        open={!!openItem}
        item={openItem}
        onClose={()=>setOpenItem(null)}
        onSave={(patch)=>{ update.mutate(patch as any); setOpenItem(null) }}
      />
    </>
  )
}
