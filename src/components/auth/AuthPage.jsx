import { useState } from 'react'
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthPage({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') await onSignIn(email, password)
      else await onSignUp(email, password, '')
    } catch (err) {
      setError(err?.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center p-4'>
      <div className='vercel-card p-8 max-w-sm w-full'>
        <div className='flex flex-col items-center mb-8'>
          <div className='w-12 h-12 rounded-md bg-gray-900 flex items-center justify-center mb-4'>
            <Zap className='w-6 h-6 text-white' />
          </div>
          <h1 className='text-2xl font-semibold text-gray-900 tracking-tight'>PadelRush</h1>
          <p className='text-sm text-gray-600 mt-1'>
            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </p>
        </div>

        {error && (
          <div className='mb-4 p-3 rounded-md bg-ship/10 border border-ship/20 flex items-center gap-2 text-sm text-ship'>
            <AlertCircle className='w-4 h-4' />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='relative'>
            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600' />
            <input 
              type='email' 
              placeholder='Email' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className='w-full h-10 pl-10 pr-4 rounded-md bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-develop transition-all text-sm' 
              required 
            />
          </div>

          <div className='relative'>
            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600' />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder='Contraseña' 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className='w-full h-10 pl-10 pr-10 rounded-md bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-develop transition-all text-sm' 
              required 
            />
            <button 
              type='button' 
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors'
            >
              {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
            </button>
          </div>

          <Button type='submit' disabled={loading} className='w-full h-10 rounded-md'>
            {loading ? <Loader2 className='w-4 h-4 animate-spin mx-auto' /> : (mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <button 
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            {mode === 'login' 
              ? <>¿No tienes cuenta? <span className='text-develop font-medium'>Regístrate</span></>
              : <>¿Ya tienes cuenta? <span className='text-develop font-medium'>Inicia Sesión</span></>
            }
          </button>
        </div>
      </div>
    </div>
  )
}