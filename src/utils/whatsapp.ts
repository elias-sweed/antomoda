import type { Producto } from '../services/productos'

export const NUMERO_WHATSAPP = '51994217012'

export function generarLinkWhatsApp(producto: Producto): string {
  const mensaje = `Hola, quiero este producto:\n\n👕 ${producto.nombre}\n💰 S/${producto.precio.toFixed(2)}\n\n¿Está disponible?`
  
  const mensajeCodificado = encodeURIComponent(mensaje)
  return `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`
}