import { create } from 'zustand'

type UIState = {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark'|'light') => void
}

export const useUI = create<UIState>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme })
}))
