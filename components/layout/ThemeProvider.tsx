'use client'
import { createContext, useContext, useEffect, useState } from 'react'
type Theme = 'dark' | 'light'
interface Ctx { theme: Theme; toggleTheme: () => void; setTheme: (t: Theme) => void }
const ThemeContext = createContext<Ctx>({ theme: 'dark', toggleTheme: () => {}, setTheme: () => {} })
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  useEffect(() => {
    const stored = (localStorage.getItem('mn-admin-theme') as Theme) ?? 'dark'
    setThemeState(stored)
    document.documentElement.classList.toggle('dark', stored === 'dark')
  }, [])
  const setTheme = (t: Theme) => {
    setThemeState(t)
    localStorage.setItem('mn-admin-theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'), setTheme }}>{children}</ThemeContext.Provider>
}
export const useTheme = () => useContext(ThemeContext)
