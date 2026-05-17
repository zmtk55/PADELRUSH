import { useState } from 'react'

export function useAuth() {
  const [user] = useState({ id: 'demo', email: 'demo@padelrush.com' })
  const [profile] = useState({ role: 'admin', display_name: 'Demo Usuario' })

  const signUp = async (email, password, displayName) => {
    return { data: null, error: null }
  }

  const signIn = async (email, password) => {
    return { data: null, error: null }
  }

  const signOut = async () => {}

  return { user, profile, loading: false, signUp, signIn, signOut, isAdmin: true, isOrganizer: true }
}
