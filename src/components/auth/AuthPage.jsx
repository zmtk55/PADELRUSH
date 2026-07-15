import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await onSignIn(email, password)
      } else {
        await onSignUp(email, password, name)
        await onSignIn(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(err?.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-background'>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className='relative w-full max-w-md mx-4'
      >
        <div className='relative bg-card border border-border-subtle rounded-lg p-8 shadow-card'>
          <div className='flex flex-col items-center mb-8'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className='w-16 h-16 rounded-2xl bg-court flex items-center justify-center mb-4 shadow-card'
            >
              <Zap className='w-8 h-8 text-primary-foreground' />
            </motion.div>
            <h1 className='text-3xl font-bold text-foreground'>PadelRush</h1>
            <p className='text-sm text-fg-secondary mt-1'>{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</p>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='mb-4 p-3 rounded-xl bg-destructive/15 border border-destructive/25 flex items-center gap-2 text-sm text-destructive'
              >
                <AlertCircle className='w-4 h-4 shrink-0' />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <AnimatePresence mode='wait'>
              {mode === 'register' && (
                <motion.div key='name' initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted' />
                    <input type='text' placeholder='Nombre' value={name} onChange={(e) => setName(e.target.value)} aria-label="Nombre"
                      className='w-full h-11 pl-10 pr-4 rounded-xl bg-elevated border border-border-subtle text-foreground placeholder:text-fg-muted/60 focus:outline-none focus:border-court/50 focus:ring-1 focus:ring-court/30 transition-all duration-200' required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted' />
              <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email"
                className='w-full h-11 pl-10 pr-4 rounded-xl bg-elevated border border-border-subtle text-foreground placeholder:text-fg-muted/60 focus:outline-none focus:border-court/50 focus:ring-1 focus:ring-court/30 transition-all duration-200' required />
            </div>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted' />
              <input type={showPassword ? 'text' : 'password'} placeholder='Contraseña' value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Contraseña"
                className='w-full h-11 pl-10 pr-10 rounded-xl bg-elevated border border-border-subtle text-foreground placeholder:text-fg-muted/60 focus:outline-none focus:border-court/50 focus:ring-1 focus:ring-court/30 transition-all duration-200' required />
              <button type='button' onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-secondary transition-colors'>
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            <Button type='submit' disabled={loading} aria-busy={loading}
              className='w-full h-11 rounded-xl bg-court hover:bg-court/90 text-primary-foreground font-semibold shadow-card shadow-court/25 transition-all duration-200'>
              {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>
          <div className='mt-6 text-center'>
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className='text-sm text-fg-muted hover:text-fg-secondary transition-colors'>
              {mode === 'login' ? <>¿No tienes cuenta? <span className='text-court hover:text-court/80 font-medium'>Regístrate</span></>
                : <>¿Ya tienes cuenta? <span className='text-court hover:text-court/80 font-medium'>Inicia Sesión</span></>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}