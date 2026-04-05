import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { obtenerProductosActivos, eliminarProducto, eliminarImagenDeStorage } from '../../services/productos'
import type { Producto } from '../../services/productos'
import { logout } from '../../services/auth'

export default function Dashboard() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesandoBorrado, setProcesandoBorrado] = useState(false)
  const navigate = useNavigate()

  const [modalEliminar, setModalEliminar] = useState<{ abierto: boolean; id: string; nombre: string }>({
    abierto: false,
    id: '',
    nombre: ''
  })

  const [modalLogout, setModalLogout] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const datos = await obtenerProductosActivos()
        setProductos(datos)
      } catch (error) {
        console.error(error)
      } finally {
        setCargando(false)
      }
    }
    fetchData()
  }, [])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const abrirConfirmacion = (id: string, nombre: string) => {
    setModalEliminar({ abierto: true, id, nombre })
  }

  async function confirmarEliminacion() {
    setProcesandoBorrado(true)
    try {
      // 1. Buscamos el producto en el estado local para obtener sus imágenes
      const productoAEliminar = productos.find(p => p.id === modalEliminar.id)

      // 2. Si tiene imágenes, las borramos del Storage primero
      if (productoAEliminar?.imagenes && productoAEliminar.imagenes.length > 0) {
        await Promise.all(
          productoAEliminar.imagenes.map(url => eliminarImagenDeStorage(url))
        )
      }

      // 3. Borramos el producto de la base de datos
      await eliminarProducto(modalEliminar.id)

      // 4. Actualizamos la interfaz
      setProductos(productos.filter(p => p.id !== modalEliminar.id))
      setModalEliminar({ abierto: false, id: '', nombre: '' })
    } catch (error) {
      console.error(error)
      alert('Error al eliminar el producto y sus archivos')
    } finally {
      setProcesandoBorrado(false)
    }
  }

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100">
      <td className="p-4"><div className="w-14 h-14 bg-gray-200 rounded-xl"></div></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded-lg w-32"></div></td>
      <td className="p-4"><div className="h-4 bg-gray-200 rounded-lg w-16"></div></td>
      <td className="p-4"><div className="h-6 bg-gray-100 rounded-full w-12"></div></td>
      <td className="p-4 text-right"><div className="h-8 bg-gray-200 rounded-xl w-24 ml-auto"></div></td>
    </tr>
  )

  return (
    // Se cambió el fondo a bg-gray-50 para un diseño limpio y rápido
    <div className="relative min-h-screen w-full flex flex-col items-center p-4 md:p-10 overflow-x-hidden bg-gray-50">

      {/* Tarjeta sólida en color blanco para resaltar sobre el fondo gris */}
      <div className="relative z-10 w-full max-w-5xl bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">
              MIS <span className="text-purple-600">PRODUCTOS</span>
            </h2>
            <p className="text-gray-500 text-sm font-medium">Gestión de inventario Anto Moda</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Link
              to="/admin/crear-producto"
              className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-purple-200 text-center text-sm"
            >
              + Nuevo Producto
            </Link>
            <button
              onClick={() => setModalLogout(true)}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-bold transition-all text-sm border border-red-100"
            >
              Salir
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Imagen</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Precio</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cargando ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-purple-50/50 transition-colors">
                    <td className="p-4">
                      <img
                        src={prod.imagenes?.[0] || 'https://via.placeholder.com/50'}
                        alt={prod.nombre}
                        className="w-14 h-14 object-cover rounded-xl shadow-sm border border-gray-100"
                      />
                    </td>
                    <td className="p-4 font-bold text-gray-800 text-sm">{prod.nombre}</td>
                    <td className="p-4 text-gray-700 font-medium">S/ {prod.precio.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${prod.stock > 3 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {prod.stock} u.
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/editar-producto/${prod.id}`}
                          className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => abrirConfirmacion(prod.id, prod.nombre)}
                          className="bg-white text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!cargando && productos.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">
                    No tienes productos registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      {modalEliminar.abierto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setModalEliminar({ ...modalEliminar, abierto: false })}
          />
          <div className="relative z-10 bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">¿Estás seguro?</h3>
              <p className="text-gray-500 mt-2 text-sm font-medium">
                Estás a punto de eliminar <span className="text-red-600 font-bold">"{modalEliminar.nombre}"</span>.
              </p>
              <div className="flex gap-3 w-full mt-8">
                <button
                  onClick={() => setModalEliminar({ ...modalEliminar, abierto: false })}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-all text-xs uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminacion}
                  disabled={procesandoBorrado}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-red-200 text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {procesandoBorrado ? '...' : 'Sí, Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {modalLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setModalLogout(false)}
          />
          <div className="relative z-10 bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-50 text-purple-600 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">¿Cerrar Sesión?</h3>
              <p className="text-gray-500 mt-2 text-sm font-medium">¿Deseas salir al sitio público?</p>
              <div className="flex gap-3 w-full mt-8">
                <button
                  onClick={() => setModalLogout(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-2xl transition-all text-xs uppercase tracking-widest"
                >
                  Volver
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-neutral-900 hover:bg-black text-white font-bold py-3 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest"
                >
                  Sí, Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}