import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

const URL = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' }

export async function req(method, path, body) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('La solicitud tardó demasiado')), 10000))
  const r = await Promise.race([fetch(`${URL}${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined }), timeout])
  if (!r.ok) { const txt = await r.text().catch(() => ''); throw new Error(txt || `Error ${r.status}`) }
  if (method === 'DELETE') return null
  return await r.json()
}

export async function authedReq(method, path, body) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('No hay sesión activa')
  const H2 = { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('La solicitud tardó demasiado')), 10000))
  const r = await Promise.race([fetch(`${URL}${path}`, { method, headers: H2, body: body ? JSON.stringify(body) : undefined }), timeout])
  if (!r.ok) { const txt = await r.text().catch(() => ''); throw new Error(txt || `Error ${r.status}`) }
  if (method === 'DELETE') return null
  return await r.json()
}

export function useFetch(fn, deps = [], initialValue = null) {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    const start = Date.now()
    fn()
      .then(d => {
        if (mounted) {
          setData(d)
          setLoading(false)
          console.log('✓ fetch OK', Date.now() - start + 'ms')
        }
      })
      .catch(e => {
        if (mounted) {
          console.log('✗ fetch ERROR', e?.message)
          if (initialValue !== null) {
            setData(initialValue)
          }
          setLoading(false)
        }
      })
    return () => { mounted = false }
  }, deps)

  useEffect(() => {
    const cancel = execute()
    return cancel
  }, [execute])

  return { data, isLoading: loading, isError: !!error, error, refetch: execute }
}
