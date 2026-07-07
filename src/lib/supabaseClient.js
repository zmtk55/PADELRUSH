import { createClient } from '@supabase/supabase-js'

// Valores hardcodeados - anon key es público
const supabaseUrl = 'https://xmpsqjhywmwdekuhudtt.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const api = {
  leagues: {
    getAll: () => supabase.from('leagues').select('*').order('created_at', { ascending: false }),
    getById: (id) => supabase.from('leagues').select('*').eq('id', id).single(),
    create: (data) => supabase.from('leagues').insert([data]).select().single(),
    update: (id, data) => supabase.from('leagues').update(data).eq('id', id).select().single(),
    delete: (id) => supabase.from('leagues').delete().eq('id', id),
  },
  teams: {
    getAll: (leagueId) => supabase.from('teams').select('*').eq('league_id', leagueId),
    create: (data) => supabase.from('teams').insert([data]).select().single(),
  },
  matches: {
    getAll: (leagueId) => supabase.from('matches').select('*').eq('league_id', leagueId),
    create: (data) => supabase.from('matches').insert([data]).select().single(),
    updateResult: (id, result) => supabase.from('matches').update({ result }).eq('id', id).select().single(),
  },
}