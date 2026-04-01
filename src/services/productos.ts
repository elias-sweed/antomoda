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
  const fileName = `${Math.random()}.${fileExt}`

  const { error } = await supabase.storage
    .from('productos')
    .upload(fileName, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('productos')
    .getPublicUrl(fileName)

  return data.publicUrl
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
  const { error } = await supabase
    .from('productos')
    .update({ estado: 'eliminado' })
    .eq('id', id)

  if (error) throw error
}