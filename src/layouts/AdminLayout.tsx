import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    /* Eliminamos bg-gray-100 y la etiqueta <nav> */
    <div className="min-h-screen w-full">
      <main className="relative">
        <Outlet />
      </main>
    </div>
  )
}