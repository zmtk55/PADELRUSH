import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { demoUser, demoProfile } from '@/lib/demoData'

function withTimeout(promise, ms = 3000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function tryAuth() {
      try {
        const { data: { session } } = await withTimeout(supabase.auth.getSession(), 3000)
        const u = session?.user ?? null
        if (!mounted) return
        if (u) {
          setUser(u)
          try {
            const { data: prof } = await withTimeout(
              supabase.from('profiles').select('*').eq('id', u.id).single(), 2000
            )
            if (prof && mounted) setProfile(prof)
          } catch {
            if (mounted) setProfile({ id: u.id, display_name: u.user_metadata?.display_name || 'Usuario', role: 'organizer' })
          }
        } else {
          if (mounted) { setUser(demoUser); setProfile(demoProfile) }
        }
      } catch {
        if (mounted) { setUser(demoUser); setProfile(demoProfile) }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    tryAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u || demoUser)
      if (!u) {
        setProfile(demoProfile)
        setLoading(false)
      }
    })
    return () => { mounted = false; subscription?.unsubscribe() }
  }, [])

  const signUp = async (email, password, displayName) => {
    try {
      return await withTimeout(supabase.auth.signUp({
        email, password,
        options: { data: { display_name: displayName } },
      }), 5000)
    } catch {
      setUser(demoUser); setProfile(demoProfile)
      return { data: { user: demoUser }, error: null }
    }
  }

  const signIn = async (email, password) => {
    try {
      return await withTimeout(supabase.auth.signInWithPassword({ email, password }), 5000)
    } catch {
      setUser(demoUser); setProfile(demoProfile)
      return { data: { user: demoUser }, error: null }
    }
  }

  const signOut = async () => {
    try {
      await withTimeout(supabase.auth.signOut(), 3000)
    } catch {}
    setUser(demoUser)
    setProfile(demoProfile)
  }

  const isAdmin = profile?.role === 'admin'
  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin'

  return { user, profile, loading, signUp, signIn, signOut, isAdmin, isOrganizer }
}
