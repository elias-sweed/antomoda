import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../services/auth'
// Importamos los iconos de Lucide (vienen con Shadcn usualmente)
import { Eye, EyeOff } from 'lucide-react' 

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Nuevo estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await login(email, password)

    if (authError) {
      setError('Credenciales incorrectas')
      setLoading(false)

      // El mensaje desaparecerá después de 4 segundos
      setTimeout(() => {
        setError('')
      }, 4000) 
      
    } else {
      navigate('/admin/dashboard')
    }
  }

  return (
    // Cambiamos bg-black por bg-neutral-950 para un "negro suave" elegante
    <div className="relative h-screen w-screen flex justify-center items-center overflow-hidden bg-neutral-950">
      
      {/* Tarjeta de Login (se mantiene intacta) */}
      <div className="relative z-10 bg-white/70 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-[90%] max-w-sm border border-white/30">
        <div className="flex flex-col items-center mb-8">
           <h2 className="text-3xl font-black text-center text-gray-900 tracking-tighter italic">
             ANTO<span className="text-purple-600">MODA</span>
           </h2>
           <div className="h-1 w-12 bg-purple-600 rounded-full mt-1"></div>
        </div>
        
        {error && (
          <p className="text-red-600 text-sm mb-4 text-center bg-red-50/80 backdrop-blur-sm p-3 rounded-xl font-bold border border-red-200">
            {error}
          </p>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white/40 placeholder-gray-400 text-gray-900"
              placeholder="admin@antomoda.com"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative">
              <input
                // Cambia dinámicamente entre password y text
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl p-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white/40 placeholder-gray-400 text-gray-900"
                placeholder="••••••••"
                required
              />
              {/* Botón del ojito */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-black text-white font-black py-4 rounded-2xl mt-2 transition-all shadow-xl active:scale-95 disabled:opacity-50 text-sm uppercase tracking-widest"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}