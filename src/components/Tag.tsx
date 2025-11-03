export default function Tag({ label }: { label: string }) {
  const v = (label ?? '').trim()
  if (!v) return null
  return <span className="badge">{v}</span>
}
