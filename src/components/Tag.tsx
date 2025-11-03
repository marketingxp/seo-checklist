type Props = { label: string }
export default function Tag({ label }: Props) {
  const v = (label ?? '').trim()
  if (v === '') return null
  if (v === 'P0 • Critical') {
    return (
      <span
        className="badge"
        style={{ borderColor: 'transparent', background: 'transparent', color: 'rgb(34, 197, 94)' }}
      > </span>
    )
  }
  return <span className="badge">{label}</span>
}
