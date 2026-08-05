import { supabase } from '@/lib/supabaseClient'

export function useTracks() {
  const getAll = () => supabase.from('tracks').select('*').order('created_at', { ascending: false })
  const getById = (id) => supabase.from('tracks').select('*').eq('id', id).single()
  const create = (data) => supabase.from('tracks').insert([data]).select().single()
  const update = (id, data) => supabase.from('tracks').update(data).eq('id', id).select().single()
  const remove = (id) => supabase.from('tracks').delete().eq('id', id)

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  }
}