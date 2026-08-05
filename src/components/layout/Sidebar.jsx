import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Trophy, Users, Calendar, UserCircle,
  Swords, Medal, Shield, Zap,
  Menu, X, ChevronLeft, LogOut, Sun, Moon, Music,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/lib/ThemeContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tracks', label: 'Pistas', icon: Zap }, // Using Zap as a placeholder for a music icon
  { to: '/ligas', label: 'Ligas', icon: Trophy },
  { to: '/express', label: 'Express', icon: Zap },
  { to: '/equipos', label: 'Equipos', icon: Swords },
  { to: '/partidos', label: 'Partidos', icon: Calendar },
  { to: '/clasificacion', label: 'Clasificación', icon: Medal },
  { to: '/participantes', label: 'Jugadores', icon: Users },
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
        'hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-[width] duration-300 relative z-20',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      <div className={cn(
        'flex items-center h-[52px] shrink-0 border-b border-sidebar-border',
        collapsed ? 'justify-center px-0' : 'px-4 gap-3'
      )}>
        <div className="w-[28px] h-[28px] flex items-center justify-center bg-court text-white text-[11px] font-bold shrink-0">
          PR
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-sm tracking-wider text-sidebar-foreground">
            PADELRUSH
          </span>
        )}
      </div>

      <nav className="flex-1 py-3 space-y-px overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn(
            'flex items-center h-[36px] text-[13px] font-medium tracking-wider uppercase transition-colors',
            collapsed ? 'justify-center mx-1' : 'gap-3 px-4',
            isActive
              ? 'bg-court/[0.12] text-court border-r-2 border-court'
              : 'text-fg-secondary hover:text-foreground hover:bg-sidebar-hover'
          )}>
            <Icon className={cn('w-[15px] h-[15px] shrink-0')} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {isOrganizer && (
          <div className="my-3 mx-4 h-px bg-sidebar-border" />
        )}

        {isOrganizer && organizerItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => cn(
            'flex items-center h-[36px] text-[13px] font-medium tracking-wider uppercase transition-colors',
            collapsed ? 'justify-center mx-1' : 'gap-3 px-4',
            isActive
              ? 'bg-court/[0.12] text-court border-r-2 border-court'
              : 'text-fg-secondary hover:text-foreground hover:bg-sidebar-hover'
          )}>
            <Icon className={cn('w-[15px] h-[15px] shrink-0')} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="py-2 space-y-px border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center h-[36px] w-full text-[13px] text-fg-secondary hover:text-foreground hover:bg-sidebar-hover transition-colors',
            collapsed ? 'justify-center' : 'gap-3 px-4'
          )}
          aria-label={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
        >
          {theme === 'light' ? <Moon className="w-[15px] h-[15px]" /> : <Sun className="w-[15px] h-[15px]" />}
          {!collapsed && <span>{theme === 'light' ? 'Modo oscuro' : 'Modo claro'}</span>}
        </button>

        {isOrganizer && (
          <button
            onClick={signOut}
            className={cn(
              'flex items-center h-[36px] w-full text-[13px] text-fg-secondary hover:text-destructive hover:bg-sidebar-hover transition-colors',
              collapsed ? 'justify-center' : 'gap-3 px-4'
            )}
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-[15px] h-[15px]" />
            {!collapsed && <span>Salir</span>}
          </button>
        )}

        {!collapsed && profile && (
          <div className="px-4 pt-3 flex items-center gap-2">
            <div className="w-[22px] h-[22px] flex items-center justify-center bg-court text-white text-[10px] font-bold">
              {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-[11px] text-fg-muted truncate uppercase tracking-wider">
              {profile.display_name || profile.email}
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-[10px] bottom-20 w-[20px] h-[20px] flex items-center justify-center z-10 bg-sidebar border border-sidebar-border hover:bg-sidebar-hover transition-colors"
        aria-label={collapsed ? 'Expandir' : 'Colapsar'}
      >
        <ChevronLeft className={cn('w-[10px] h-[10px] text-fg-secondary transition-transform', collapsed && 'rotate-180')} />
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
      <header className="md:hidden flex items-center justify-between px-4 h-[48px] sticky top-0 z-40 bg-background border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] flex items-center justify-center bg-court text-white text-[10px] font-bold">
            PR
          </div>
          <span className="font-heading font-bold text-sm tracking-wider">PADELRUSH</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleTheme} className="w-8 h-8 flex items-center justify-center text-fg-secondary hover:text-foreground" aria-label={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
            {theme === 'light' ? <Moon className="w-[14px] h-[14px]" /> : <Sun className="w-[14px] h-[14px]" />}
          </button>
          <button onClick={() => setOpen(true)} className="w-8 h-8 flex items-center justify-center text-fg-secondary hover:text-foreground" aria-label="Abrir menú">
            <Menu className="w-[14px] h-[14px]" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-[280px] bg-sidebar border-l border-sidebar-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 h-[48px] border-b border-sidebar-border">
                <span className="font-heading font-bold text-sm tracking-wider">MENU</span>
                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center text-fg-secondary hover:text-foreground" aria-label="Cerrar menú">
                  <X className="w-[14px] h-[14px]" />
                </button>
              </div>

              <nav className="p-3 space-y-px">
                {[...navItems, ...(isOrganizer ? organizerItems : [])].map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => cn(
                    'flex items-center gap-3 h-[40px] px-3 text-[13px] font-medium tracking-wider uppercase',
                    isActive
                      ? 'bg-court/[0.12] text-court'
                      : 'text-fg-secondary hover:text-foreground hover:bg-sidebar-hover'
                  )}>
                    <Icon className="w-[15px] h-[15px]" />
                    {label}
                  </NavLink>
                ))}
              </nav>

              <div className="p-3 space-y-px border-t border-sidebar-border">
                {profile && (
                  <button onClick={signOut} className="flex items-center gap-3 h-[40px] px-3 w-full text-[13px] text-fg-secondary hover:text-destructive hover:bg-sidebar-hover">
                    <LogOut className="w-[15px] h-[15px]" />
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
