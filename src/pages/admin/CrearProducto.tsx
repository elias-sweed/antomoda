import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearProducto, subirImagen } from '../../services/productos'
import { Tranquiluxe } from "uvcanvas"

const TALLAS_DISPONIBLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Estándar']
const CATEGORIAS = ['Polos', 'Pantalones', 'Vestidos', 'Conjuntos', 'Casacas', 'Accesorios', 'Otros']

export default function CrearProducto() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  // Cambiamos a un array de archivos
  const [imagenes, setImagenes] = useState<File[]>([])
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '',
    categoria: 'Polos',
    colores: ''
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const nuevosArchivos = Array.from(e.target.files)
      // Limitamos a 5 imágenes en total
      setImagenes(prev => [...prev, ...nuevosArchivos].slice(0, 5))
    }
  }

  const eliminarImagen = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index))
  }

  const toggleTalla = (talla: string) => {
    setTallasSeleccionadas(prev => 
      prev.includes(talla) 
        ? prev.filter(t => t !== talla)
        : [...prev, talla]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Subimos todas las imágenes en paralelo
      const urlsPromesas = imagenes.map(img => subirImagen(img))
      const urlsSubidas = await Promise.all(urlsPromesas)

      const arrayColores = formData.colores
        .split(',')
        .map(color => color.trim())
        .filter(color => color !== '')

      await crearProducto({
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        descripcion: formData.descripcion || null,
        categoria: formData.categoria,
        tallas: tallasSeleccionadas.length > 0 ? tallasSeleccionadas : null,
        colores: arrayColores.length > 0 ? arrayColores : null,
        imagenes: urlsSubidas, // Enviamos el array de URLs
        estado: 'activo'
      })

      navigate('/admin/dashboard')
    } catch (error) {
      console.error(error)
      alert('Error al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-10 overflow-x-hidden">
      
      <div className="fixed inset-0 z-0">
        <Tranquiluxe />
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 mb-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
            NUEVO <span className="text-purple-600">PRODUCTO</span>
          </h2>
          <div className="h-1 w-12 bg-purple-600 rounded-full mt-1"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 transition-all"
                placeholder="Ej: Polo Oversize"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 transition-all appearance-none"
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Precio (S/)</label>
              <input
                type="number"
                step="0.10"
                required
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Stock</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
              Imágenes del Producto <span className="text-purple-600">({imagenes.length}/5)</span>
            </label>
            
            {/* Grid de previsualización */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2">
              {imagenes.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <img 
                    src={URL.createObjectURL(img)} 
                    alt={`Vista previa ${index}`} 
                    className="w-full h-full object-cover rounded-xl border-2 border-purple-400 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarImagen(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md border border-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {/* Cuadro para agregar más si falta para llegar a 5 */}
              {imagenes.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[8px] font-black uppercase mt-1">Subir</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-gray-400 italic">Puedes seleccionar varias imágenes a la vez.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tallas</label>
            <div className="flex flex-wrap gap-2">
              {TALLAS_DISPONIBLES.map(talla => (
                <button
                  type="button"
                  key={talla}
                  onClick={() => toggleTalla(talla)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    tallasSeleccionadas.includes(talla)
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {talla}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-4 rounded-2xl transition-all text-sm uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neutral-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all shadow-xl disabled:opacity-50 text-sm uppercase tracking-widest"
            >
              {loading ? 'Subiendo...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}