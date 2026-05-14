import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, supabaseUrl, supabaseAnonKey } from '@/lib/supabaseClient'
import { toast } from 'sonner'

const DEFAULT_CONFIG = {
  app_name: 'PadelRush',
  app_logo: 'PR',
  primary_color: '#c96442',
  default_sport: 'padel',
  default_sets: 2,
  tiebreak_enabled: true,
  sports: ['padel', 'tenis', 'squash', 'otro'],
  contact_whatsapp: '',
  contact_instagram: '',
  contact_facebook: '',
  contact_website: '',
}

async function fetchFrom(path, signal) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    signal,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function useSystemConfig() {
  const queryClient = useQueryClient()

  const configQuery = useQuery({
    queryKey: ['system-config'],
    queryFn: async ({ signal }) => {
      const rows = await fetchFrom('system_config?select=*&limit=50', signal)
      const config = { ...DEFAULT_CONFIG }
      rows.forEach((r) => { config[r.key] = r.value })
      return config
    },
    staleTime: 60_000,
    retry: 1,
  })

  const updateConfig = useMutation({
    mutationFn: async (values) => {
      const upserts = Object.entries(values).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value,
      }))
      const { error } = await supabase.from('system_config').upsert(upserts, { onConflict: 'key' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] })
      toast.success('Configuración guardada')
    },
    onError: (err) => toast.error(err.message),
  })

  return { config: configQuery.data || DEFAULT_CONFIG, isLoading: configQuery.isLoading, updateConfig }
}
