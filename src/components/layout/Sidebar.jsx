import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Trophy, Users, Calendar, UserCircle,
  Menu, X, ChevronLeft, LogOut, Sun, Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/ThemeContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ligas', label: 'Ligas', icon: Trophy },
  { to: '/participantes', label: 'Participantes', icon: Users },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { profile, isOrganizer, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-sidebar border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm shrink-0">
          PR
        </div>
        {!collapsed && <span className="font-heading font-semibold text-lg">PadelRush</span>}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent/10 text-sidebar-accent'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {isOrganizer && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent/10 text-sidebar-accent'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-muted hover:text-sidebar-foreground'
              )
            }
          >
            <UserCircle className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Perfil</span>}
          </NavLink>
        )}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-muted transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && <span>{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>}
        </button>

        {profile && (
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-muted transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        )}

        {!collapsed && profile && (
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {profile.display_name || profile.email}
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 -right-3 w-6 h-6 rounded-full bg-sidebar border border-border flex items-center justify-center shadow-sm"
      >
        <ChevronLeft className={cn('w-3 h-3 transition-transform', collapsed && 'rotate-180')} />
      </button>
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { isOrganizer, signOut, profile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-xs">PR</div>
          <span className="font-heading font-semibold">PadelRush</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-72 bg-sidebar shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-border">
                <span className="font-heading font-semibold">Menú</span>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="p-4 space-y-1">
                {[...navItems, ...(isOrganizer ? [{ to: '/profile', label: 'Perfil', icon: UserCircle }] : [])].map(
                  ({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-accent/10 text-sidebar-accent'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-muted'
                        )
                      }
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </NavLink>
                  )
                )}
              </nav>

              <div className="p-4 border-t border-border space-y-1">
                <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-muted transition-colors">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {theme === 'dark' ? 'Claro' : 'Oscuro'}
                </button>
                {profile && (
                  <button onClick={signOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-muted transition-colors">
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                )}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
