import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Safety timeout: force loading off after 8s to prevent endless spinner
    const safetyTimer = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 8000)

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          let { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .single()

          // Auto-promote first user to organizer (no other organizers exist)
          if (prof && prof.role === 'player') {
            const { count } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .in('role', ['organizer', 'admin'])
            if (count === 0) {
              const { data: updated } = await supabase
                .from('profiles')
                .update({ role: 'organizer' })
                .eq('id', u.id)
                .select()
                .single()
              if (updated) prof = updated
            }
          }
          if (mounted) setProfile(prof)
        }
      } catch (e) {
        console.error('Auth init error:', e)
      } finally {
        clearTimeout(safetyTimer)
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        let { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()

        if (prof && prof.role === 'player') {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .in('role', ['organizer', 'admin'])
          if (count === 0) {
            const { data: updated } = await supabase
              .from('profiles')
              .update({ role: 'organizer' })
              .eq('id', u.id)
              .select()
              .single()
            if (updated) prof = updated
          }
        }
        if (mounted) setProfile(prof)
      } else {
        setProfile(null)
      }
      if (mounted) setLoading(false)
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
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
