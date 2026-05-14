import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'

const NotificationContext = createContext()

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    let mounted = true

    async function poll() {
      try {
        const matches = await fetchFrom(`matches?select=id,status,scheduled_date,team1_name,team2_name&status=eq.programado&limit=5`)
        const upcoming = matches.filter((m) => {
          if (!m.scheduled_date) return false
          const diff = new Date(m.scheduled_date) - new Date()
          return diff > 0 && diff < 86400000 * 2 // next 48h
        })

        if (!mounted) return
        const items = upcoming.map((m) => ({
          id: `match-${m.id}`,
          message: `${m.team1_name || '?'} vs ${m.team2_name || '?'} — ${new Date(m.scheduled_date).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}`,
          type: 'upcoming_match',
          read: false,
        }))
        setNotifications(items)
        setUnreadCount(items.filter((n) => !n.read).length)
      } catch {
        // silently fail
      }
    }

    poll()
    const interval = setInterval(poll, 60000)
    return () => { mounted = false; clearInterval(interval) }
  }, [user])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider')
  return ctx
}
