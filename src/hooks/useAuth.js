import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function tryAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const u = session?.user ?? null
        if (!mounted) return
        if (u) {
          setUser(u)
          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', u.id)
              .single()
            if (prof && mounted) setProfile(prof)
          } catch {
            if (mounted) setProfile({ id: u.id, display_name: u.user_metadata?.display_name || 'Usuario', role: 'organizer' })
          }
        }
      } catch {
        // Auth failed, user stays null
      } finally {
        if (mounted) setLoading(false)
      }
    }

    tryAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        supabase.from('profiles').select('*').eq('id', u.id).single().then(({ data: prof }) => {
          if (prof) setProfile(prof)
        })
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => { mounted = false; subscription?.unsubscribe() }
  }, [])

  const signUp = async (email, password, displayName) => {
    return await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } },
    })
  }

  const signIn = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'
  const isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin'

  return { user, profile, loading, signUp, signIn, signOut, isAdmin, isOrganizer }
}
