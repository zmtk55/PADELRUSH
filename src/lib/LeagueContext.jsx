import { createContext, useContext, useState } from 'react'

const LeagueContext = createContext()

export function LeagueProvider({ children }) {
  const [activeLeague, setActiveLeague] = useState(null)
  return (
    <LeagueContext.Provider value={{ activeLeague, setActiveLeague }}>
      {children}
    </LeagueContext.Provider>
  )
}

export function useLeague() {
  const ctx = useContext(LeagueContext)
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider')
  return ctx
}
