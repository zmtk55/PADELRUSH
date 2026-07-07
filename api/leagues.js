import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { method, query } = req
  const userId = req.headers['x-user-id']

  switch (method) {
    case 'GET':
      const { data: leagues, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) return res.status(400).json({ error: error.message })
      return res.status(200).json(leagues)

    case 'POST':
      const { name, description } = req.body
      const { data, error: createError } = await supabase
        .from('leagues')
        .insert([{ name, description, user_id: userId }])
        .select()
        .single()
      
      if (createError) return res.status(400).json({ error: createError.message })
      return res.status(201).json(data)

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}