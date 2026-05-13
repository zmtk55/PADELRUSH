import { useState, useEffect, useCallback } from 'react'

const URL = 'https://xmpsqjhywmwdekuhudtt.supabase.co/rest/v1'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtcHNxamh5d213ZGVrdWh1ZHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjM5NzgsImV4cCI6MjA5MzgzOTk3OH0.-6CSavZAVZhRV72MTsaoJZN0cRvlS8ee-9Tc2jFuLRQ'
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' }

export async function req(method, path, body) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), 10000)
  try {
    const r = await fetch(`${URL}${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined, signal: c.signal })
    if (!r.ok) { const txt = await r.text().catch(() => ''); throw new Error(txt || `Error ${r.status}`) }
    if (method === 'DELETE') return null
    return await r.json()
  } finally { clearTimeout(t) }
}

export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const execute = useCallback(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fn().then(d => { if (mounted) { setData(d); setLoading(false) } })
       .catch(e => { if (mounted) { setError(e); setLoading(false) } })
    return () => { mounted = false }
  }, deps) // eslint-disable-line

  useEffect(() => { const cancel = execute(); return cancel }, [execute])

  return { data, isLoading: loading, isError: !!error, error, refetch: execute }
}
