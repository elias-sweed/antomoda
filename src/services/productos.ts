import { supabase } from '../config/supabase'

export interface Producto {
  id: string
  nombre: string
  precio: number
  descripcion: string | null
  categoria: string | null
  tallas: string[] | null
  colores: string[] | null
  stock: number
  imagenes: string[] | null
  estado: string
  fecha_creacion: string
}

export async function obtenerProductosActivos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('estado', 'activo')
    .order('fecha_creacion', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  
  return data as Producto[]
}

export async function obtenerProductoPorId(id: string) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Producto
}

export async function subirImagen(file: File) {
  const fileExt = file.name.split('.').pop()
  // Usamos un timestamp para evitar colisiones de nombres
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { error } = await supabase.storage
    .from('productos')
    .upload(fileName, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('productos')
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * Extrae el nombre del archivo de la URL pública y lo borra del storage
 */
export async function eliminarImagenDeStorage(url: string) {
  try {
    // Las URLs de Supabase terminan en /nombre-del-archivo
    const nombreArchivo = url.split('/').pop()
    if (nombreArchivo) {
      await supabase.storage
        .from('productos')
        .remove([nombreArchivo])
    }
  } catch (error) {
    console.error("Error al limpiar storage:", error)
  }
}

export async function crearProducto(producto: Partial<Producto>) {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()

  if (error) throw error
  return data
}

export async function actualizarProducto(id: string, producto: Partial<Producto>) {
  const { data, error } = await supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function eliminarProducto(id: string) {
  // Ahora hacemos un DELETE real para no dejar rastro en la base de datos
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', id)

  if (error) throw error
}