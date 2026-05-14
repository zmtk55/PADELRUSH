import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ShieldOff, Trash2, Search, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { useAdmin } from '@/hooks/useAdmin'

const roleColors = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  organizer: 'bg-primary/10 text-primary',
  player: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function AdminUsers() {
  const { usersQuery, updateRole, deleteUser } = useAdmin()
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const users = (usersQuery.data || []).filter(
    (u) => !search || u.display_name?.toLowerCase().includes(search.toLowerCase()) || u.id?.includes(search)
  )

  const handleRoleToggle = (user) => {
    const nextRole = user.role === 'admin' ? 'organizer' : user.role === 'organizer' ? 'player' : 'organizer'
    updateRole.mutate({ id: user.id, role: nextRole })
  }

  if (usersQuery.isError) {
    return (
      <div>
        <PageHeader title="Usuarios" description="Administración de usuarios del sistema" />
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-3" />
          <p className="text-lg font-medium mb-1">Error al cargar usuarios</p>
          <Button variant="outline" onClick={() => usersQuery.refetch()}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Usuarios" description="Administración de usuarios del sistema" />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o ID..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Usuario</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Rol</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Registro</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    {usersQuery.isLoading ? 'Cargando...' : 'No se encontraron usuarios'}
                  </td>
                </tr>
              )}
              {users.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {(u.display_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium truncate max-w-[150px]">{u.display_name || 'Sin nombre'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground font-mono text-xs hidden sm:table-cell truncate max-w-[100px]">
                    {u.id.slice(0, 8)}...
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[u.role] || roleColors.player}`}>
                      {u.role || 'player'}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground text-xs hidden md:table-cell">
                    {new Date(u.created_at).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRoleToggle(u)}
                        disabled={updateRole.isPending}
                        title={u.role === 'admin' ? 'Degradar' : u.role === 'organizer' ? 'Hacer jugador' : 'Ascender a organizador'}
                      >
                        {u.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                      </Button>
                      {confirmDelete === u.id ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="destructive" onClick={() => { deleteUser.mutate(u.id); setConfirmDelete(null) }}>
                            Confirmar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmDelete(u.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {users.length} usuario{users.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
