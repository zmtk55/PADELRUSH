import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const demoProfiles = [
  { id: 'user-1', email: 'julian@padelrush.com', display_name: 'Julian Arocha', role: 'admin', created_at: '2026-01-01' },
  { id: 'user-2', email: 'organizador@padelrush.com', display_name: 'Organizador Demo', role: 'organizer', created_at: '2026-01-05' },
  { id: 'user-3', email: 'player@padelrush.com', display_name: 'Jugador Demo', role: 'player', created_at: '2026-01-10' },
]

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function useAdmin() {
  const queryClient = useQueryClient()

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async ({ signal }) => {
      try {
        const profiles = await fetchFrom('profiles?select=*&order=created_at.desc&limit=200', signal)
        if (!profiles || profiles.length === 0) return demoProfiles
        return profiles
      } catch (e) {
        return demoProfiles
      }
    },
    staleTime: 30_000,
    retry: 1,
  })

  const updateRole = useMutation({
    mutationFn: async ({ id, role }) => {
      const { data, error } = await supabase.from('profiles').update({ role }).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Rol actualizado')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteUser = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      // Also try to delete auth user (may be restricted by RLS)
      await supabase.auth.admin.deleteUser(id).catch(() => {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('Usuario eliminado')
    },
    onError: (err) => toast.error(err.message),
  })

  return { usersQuery, updateRole, deleteUser }
}
