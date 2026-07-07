import { supabase } from '../../lib/supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, display_name } = req.body
    
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { display_name }
    })
    
    if (error) return res.status(400).json({ error: error.message })
    
    return res.status(201).json({ user })
  }
  
  res.setHeader('Allow', ['POST'])
  res.status(405).end('Method Not Allowed')
}