import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  obtenerProductoPorId, 
  actualizarProducto, 
  subirImagen, 
  eliminarImagenDeStorage
} from '../../services/productos'

const TALLAS_DISPONIBLES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Estándar']
const CATEGORIAS = ['Polos', 'Pantalones', 'Vestidos', 'Conjuntos', 'Casacas', 'Accesorios', 'Otros']

export default function EditarProducto() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [cargandoDatos, setCargandoDatos] = useState(true)
  
  // Estados para las imágenes
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]) // URLs que ya están en la DB
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]) // Archivos nuevos a subir
  
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '',
    categoria: 'Polos',
    colores: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        const producto = await obtenerProductoPorId(id)
        setFormData({
          nombre: producto.nombre,
          precio: producto.precio.toString(),
          stock: producto.stock.toString(),
          descripcion: producto.descripcion || '',
          categoria: producto.categoria || 'Polos',
          colores: producto.colores ? producto.colores.join(', ') : ''
        })
        setTallasSeleccionadas(producto.tallas || [])
        setImagenesExistentes(producto.imagenes || [])
      } catch (error) {
        console.error('Error al cargar producto:', error)
        navigate('/admin/dashboard')
      } finally {
        setCargandoDatos(false)
      }
    }
    
    fetchData()
  }, [id, navigate])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const archivos = Array.from(e.target.files)
      // Calculamos cuánto espacio queda (Máximo 5)
      const espacioDisponible = 5 - imagenesExistentes.length - nuevasImagenes.length
      const archivosAceptados = archivos.slice(0, espacioDisponible)
      
      setNuevasImagenes(prev => [...prev, ...archivosAceptados])
    }
  }

  const eliminarImagenExistente = (url: string) => {
    setImagenesExistentes(prev => prev.filter(img => img !== url))
  }

  const eliminarNuevaImagen = (index: number) => {
    setNuevasImagenes(prev => prev.filter((_, i) => i !== index))
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
    if (!id) return
    setLoading(true)

    try {
      // 1. Obtener el producto actual de la DB para comparar imágenes
      const productoOriginal = await obtenerProductoPorId(id)
      const imagenesAnteriores = productoOriginal.imagenes || []

      // 2. Identificar qué imágenes estaban antes pero ya no están (fueron eliminadas en el UI)
      const imagenesParaBorrarDeStorage = imagenesAnteriores.filter(
        (urlAnterior) => !imagenesExistentes.includes(urlAnterior)
      )

      // 3. Borrar físicamente los archivos del bucket de Supabase
      if (imagenesParaBorrarDeStorage.length > 0) {
        await Promise.all(
          imagenesParaBorrarDeStorage.map((url) => eliminarImagenDeStorage(url))
        )
      }

      // 4. Subir las nuevas imágenes seleccionadas
      const urlsNuevasPromesas = nuevasImagenes.map(img => subirImagen(img))
      const urlsNuevasSubidas = await Promise.all(urlsNuevasPromesas)

      // 5. Combinar las imágenes que se quedaron con las nuevas subidas
      const todasLasImagenes = [...imagenesExistentes, ...urlsNuevasSubidas]

      const arrayColores = formData.colores
        .split(',')
        .map(color => color.trim())
        .filter(color => color !== '')

      // 6. Actualizar el registro en la base de datos
      await actualizarProducto(id, {
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        descripcion: formData.descripcion || null,
        categoria: formData.categoria,
        tallas: tallasSeleccionadas.length > 0 ? tallasSeleccionadas : null,
        colores: arrayColores.length > 0 ? arrayColores : null,
        imagenes: todasLasImagenes
      })

      navigate('/admin/dashboard')
    } catch (error) {
      console.error(error)
      alert('Error al actualizar el producto o limpiar el almacenamiento')
    } finally {
      setLoading(false)
    }
  }

  if (cargandoDatos) {
    return (
      // Actualizamos la pantalla de carga para que sea consistente
      <div className="relative min-h-screen w-full flex justify-center items-center bg-gray-50">
        <div className="relative z-10 text-gray-500 font-bold animate-pulse">Cargando datos del producto...</div>
      </div>
    )
  }

  const totalImagenes = imagenesExistentes.length + nuevasImagenes.length

  return (
    // Fondo gris claro (bg-gray-50) y sin animación
    <div className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-10 overflow-x-hidden bg-gray-50">

      {/* Tarjeta blanca sólida */}
      <div className="relative z-10 w-full max-w-2xl bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
            EDITAR <span className="text-purple-600">PRODUCTO</span>
          </h2>
          <div className="h-1 w-12 bg-purple-600 rounded-full mt-1"></div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Precio (S/)</label>
              <input
                type="number"
                step="0.10"
                required
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Stock</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Descripción</label>
            <textarea
              rows={2}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all resize-none"
            />
          </div>

          {/* GESTIÓN DE IMÁGENES */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
              Imágenes del Producto <span className="text-purple-600">({totalImagenes}/5)</span>
            </label>
            
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {/* Imágenes que ya están en la DB */}
              {imagenesExistentes.map((url, index) => (
                <div key={`old-${index}`} className="relative aspect-square">
                  <img src={url} alt="Existente" className="w-full h-full object-cover rounded-xl border-2 border-gray-200 opacity-90" />
                  <button
                    type="button"
                    onClick={() => eliminarImagenExistente(url)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md border border-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-800 text-[6px] text-white px-1 rounded uppercase font-black">Online</span>
                </div>
              ))}

              {/* Nuevas imágenes seleccionadas */}
              {nuevasImagenes.map((file, index) => (
                <div key={`new-${index}`} className="relative aspect-square">
                  <img src={URL.createObjectURL(file)} alt="Nueva" className="w-full h-full object-cover rounded-xl border-2 border-purple-400" />
                  <button
                    type="button"
                    onClick={() => eliminarNuevaImagen(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-md border border-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-600 text-[6px] text-white px-1 rounded uppercase font-black">Nueva</span>
                </div>
              ))}

              {/* Botón para agregar más */}
              {totalImagenes < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
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

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Colores</label>
            <input
              type="text"
              value={formData.colores}
              onChange={(e) => setFormData({ ...formData, colores: e.target.value })}
              className="w-full border border-gray-200 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"
              placeholder="Negro, Blanco..."
            />
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
              {loading ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}