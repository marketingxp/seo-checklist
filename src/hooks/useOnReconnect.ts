import { useEffect } from 'react'

export function useOnReconnect(cb: () => void) {
  useEffect(() => {
    const h = () => cb()
    window.addEventListener('online', h)
    return () => window.removeEventListener('online', h)
  }, [cb])
}
