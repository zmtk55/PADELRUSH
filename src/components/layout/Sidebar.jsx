import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Trophy, Users, Swords, Calendar, 
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut,
  Shield, Target, Menu, X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Trophy, label: 'Ligas', path: '/ligas' },
  { icon: Users, label: 'Participantes', path: '/participantes' },
  { icon: Swords, label: 'Partidos', path: '/partidos' },
  { icon: BarChart3, label: 'Clasificación', path: '/clasificacion' },
]

const adminItems = [
  { icon: Shield, label: 'Admin', path: '/admin' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { profile, isAdmin, signOut } = useAuth()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <aside className={cn(
      "hidden md:flex fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-200 flex-col",
      collapsed ? "w-[68px]" : "w-[240px]"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Target className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">PadelRush</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              isActive(item.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              {!collapsed && (
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </p>
              )}
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-3">
        {!collapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {profile.display_name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.display_name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-9"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={signOut} className="h-9">
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { profile, isAdmin, signOut } = useAuth()
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location.pathname])

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 h-12 sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-tight">PadelRush</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-72 bg-card border-l border-border shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-12 border-b border-border">
              <span className="font-bold text-sm">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="p-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {isAdmin && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Admin
                    </p>
                  </div>
                  {adminItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </>
              )}
            </nav>

            <div className="border-t border-border p-3 space-y-1">
              {profile && (
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {profile.display_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile.display_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-accent transition-all duration-150"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
