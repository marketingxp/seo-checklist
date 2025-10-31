import { useEffect } from 'react'
export default function Modal({open,onClose,children}:{open:boolean;onClose:()=>void;children:React.ReactNode}){
  useEffect(()=>{function onKey(e:KeyboardEvent){if(e.key==='Escape') onClose()} if(open){document.addEventListener('keydown',onKey)} return ()=>document.removeEventListener('keydown',onKey)},[open,onClose])
  if(!open) return null
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(2,8,23,.6)',backdropFilter:'blur(6px)',display:'grid',placeItems:'center',zIndex:50}} onClick={onClose}>
      <div style={{width:'min(860px,92vw)',maxHeight:'86vh',overflow:'auto'}} onClick={e=>e.stopPropagation()} className="card card-pad">
        {children}
      </div>
    </div>
  )
}
