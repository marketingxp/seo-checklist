type Props={ status:'todo'|'in_progress'|'blocked'|'done' }
export default function StatusBadge({status}:Props){
  const map:Record<string,{label:string,cls:string}>={
    todo:{label:'To-do',cls:'s-todo'},
    in_progress:{label:'In progress',cls:'s-inprog'},
    blocked:{label:'Blocked',cls:'s-blocked'},
    done:{label:'Done',cls:'s-done'}
  }
  const m=map[status]||map.todo
  return (
    <span className="badge">
      <span className={`status-dot ${m.cls}`} />
      {m.label}
    </span>
  )
}
