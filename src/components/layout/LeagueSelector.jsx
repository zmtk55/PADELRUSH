import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLeagues } from '@/hooks/useLeagues'
import { PageHeader } from '@/components/layout/PageHeader'
import { ChevronRight } from 'lucide-react'

export default function LeagueSelector({ icon: Icon, title, description, route, emptyText, emptyDescription }) {
  const navigate = useNavigate()
  const { leaguesQuery } = useLeagues()
  const leagues = leaguesQuery.data || []

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader title={title} description={description} />

      {leaguesQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card border border-border-subtle p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!leaguesQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagues.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate(route.replace(/\$\{id\}/g, l.id))}
              className="group bg-card border border-border-subtle p-5 hover:shadow-card-hover transition-all cursor-pointer card-accent-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md"
                  style={{ backgroundColor: l.color || '#c96442' }}>
                  {l.name?.charAt(0) || ''}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate group-hover:text-court transition-colors">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.gender} · {l.season || '\u2014'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-court transition-all group-hover:translate-x-0.5 shrink-0" />
              </div>
            </motion.div>
          ))}

          {leagues.length === 0 && (
            <div className="text-center py-20 col-span-full">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">{emptyText}</p>
              {emptyDescription && (
                <p className="text-sm text-muted-foreground">{emptyDescription}</p>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
