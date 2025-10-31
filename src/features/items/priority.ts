export type Priority = 'low'|'medium'|'high'
export const prioColors: Record<Priority,string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444'
}
export function getPriority(tags: string[]|null|undefined): Priority {
  const t = (tags||[]).find(x=>/^prio:(low|medium|high)$/.test(x))
  if (!t) return 'medium'
  return t.split(':')[1] as Priority
}
export function setPriority(tags: string[]|null|undefined, p: Priority): string[] {
  const rest = (tags||[]).filter(x=>!/^prio:(low|medium|high)$/.test(x))
  return [...rest, `prio:${p}`]
}
