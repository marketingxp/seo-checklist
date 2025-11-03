export default function Tag({ label }: { label: string }) {
  const norm = (label || '').toLowerCase()
  const cls =
    norm.includes('high')   ? 'badge priority-high'   :
    norm.includes('medium') ? 'badge priority-medium' :
    norm.includes('low')    ? 'badge priority-low'    :
                               'badge'
  return <span className={cls}>{label}</span>
}
