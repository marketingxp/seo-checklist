import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ItemCard from './ItemCard'
import type { Item } from './api'

export default function SortableCard({
  item,
  projectId,
  onOpen
}: {
  item: Item
  projectId: string
  onOpen?: (it: Item)=>void
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  return (
    <div style={style}>
      <ItemCard
        item={item}
        onOpen={onOpen}
        dragProps={{ setNodeRef, attributes, listeners, isDragging }}
      />
    </div>
  )
}
