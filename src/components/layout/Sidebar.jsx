import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Trophy, Users, Calendar, UserCircle,
  Flag, Medal, Shield, Flame,
  Menu, X, ChevronLeft, LogOut, Sun, Moon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/ThemeContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/ligas', label: 'Ligas', icon: Trophy },
  { to: '/express', label: 'Express', icon: Flame },
  { to: '/equipos', label: 'Equipos', icon: Flag },
  { to: '/partidos', label: 'Partidos', icon: Calendar },
  { to: '/clasificacion', label: 'Clasificacion', icon: Medal },
  { to: '/participantes', label: 'Participantes', icon: Users },
]

const organizerItems = [
  { to: '/profile', label: 'Perfil', icon: UserCircle },
  { to: '/admin', label: 'Admin', icon: Shield },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { profile, isOrganizer, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-sidebar border-r border-border transition-[width] duration-300 ease-out relative',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 shrink-0 border-b border-border">
        <div className="w-7 h-7 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold shrink-0 rounded-sm">
          PR
        </div>
        <span
          className={cn(
            'font-heading font-bold text-base tracking-tight transition-all duration-300',
            collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
          )}
        >
          PadelRush
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 touch-y text-sm font-body transition-all duration-200 rounded-sm',
                'hover:bg-secondary group relative',
                isActive
                  ? 'bg-secondary font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-foreground rounded-r-sm"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                <span
                  className={cn(
                    'transition-all duration-300 whitespace-nowrap',
                    collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
        {isOrganizer && (
          <div className="my-3 mx-3 h-px bg-border" />
        )}

        {isOrganizer && organizerItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 touch-y text-sm font-body transition-all duration-200 rounded-sm',
                'hover:bg-secondary group relative',
                isActive
                  ? 'bg-secondary font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-org"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-foreground rounded-r-sm"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-foreground' : 'text-muted-foreground')} />
                <span
                  className={cn(
                    'transition-all duration-300 whitespace-nowrap',
                    collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 space-y-0.5 border-t border-border">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-sm hover:bg-secondary group"
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 shrink-0" />
          )}
          {!collapsed && (
            <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>
          )}
        </button>

        {isOrganizer && (
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-body text-muted-foreground hover:text-destructive transition-colors duration-200 rounded-sm hover:bg-secondary group"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Salir</span>}
          </button>
        )}

        {!collapsed && profile && (
          <div className="px-3 pt-2 flex items-center gap-2">
            <div className="w-5 h-5 flex items-center justify-center bg-muted text-muted-foreground text-[10px] font-semibold rounded-sm shrink-0">
              {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {profile.display_name || profile.email}
            </span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 bottom-20 w-6 h-6 flex items-center justify-center z-10 bg-background border border-border rounded-sm hover:bg-secondary transition-colors"
      >
        <ChevronLeft className={cn('w-3 h-3 text-muted-foreground transition-transform', collapsed && 'rotate-180')} />
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
      <header className="md:hidden flex items-center justify-between px-4 h-12 sticky top-0 z-40 bg-background border-b border-border safe-top">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold shrink-0 rounded-sm">
            PR
          </div>
          <span className="font-heading font-bold text-sm tracking-tight">
            PadelRush
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="touch-target w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="touch-target">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-80 sm:w-72 bg-sidebar border-l border-border shadow-elevated tap-highlight-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 h-12 border-b border-border">
                <span className="font-heading font-bold text-base">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="touch-target">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="p-4 space-y-0.5">
                {[...navItems, ...(isOrganizer ? organizerItems : [])].map(
                  ({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-3 touch-y text-sm font-body rounded-sm transition-colors',
                          isActive
                            ? 'bg-secondary font-semibold text-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                    </NavLink>
                  )
                )}
              </nav>

              <div className="p-4 space-y-0.5 border-t border-border">
                {profile && (
                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-body text-muted-foreground hover:text-destructive transition-colors rounded-sm hover:bg-secondary"
                  >
                    <LogOut className="w-4 h-4" />
                    Salir
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
