const BLOCK = new Set([
  'P0 • Critical',
  'P1 • High',
  'P2 • Medium',
  'P3 • Low'
])
export default function Tag({ label }: { label: string }) {
  if (!label || BLOCK.has(label.trim())) return null
  return <span className="badge">{label}</span>
}
