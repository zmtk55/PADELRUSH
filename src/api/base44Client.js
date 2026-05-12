import { supabase } from '@/lib/supabaseClient'

function entity(table) {
  return {
    async filter(filters = {}) {
      let query = supabase.from(table).select('*')
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null) query = query.eq(key, val)
      })
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    async create(data) {
      const { data: result, error } = await supabase.from(table).insert(data).select().single()
      if (error) throw error
      return result
    },
    async update(id, data) {
      const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select().single()
      if (error) throw error
      return result
    },
    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },
  }
}

export const base44 = {
  entities: {
    Team: entity('teams'),
    League: entity('leagues'),
    Match: entity('matches'),
    Participant: entity('participants'),
    PlayerStats: entity('player_stats'),
  },
}
