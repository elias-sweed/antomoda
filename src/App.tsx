import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/public/Home'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import CrearProducto from './pages/admin/CrearProducto'
import EditarProducto from './pages/admin/EditarProducto'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
        </Route>
        
        {/* RUTA DE LOGIN (FUERA DE CUALQUIER LAYOUT) */}
        {/* Esto permite que sea Pantalla Completa real sin interferencias */}
        <Route path="/admin/login" element={<Login />} />

        {/* RUTAS DE ADMINISTRACIÓN PROTEGIDAS */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="crear-producto" 
            element={
              <ProtectedRoute>
                <CrearProducto />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="editar-producto/:id" 
            element={
              <ProtectedRoute>
                <EditarProducto />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App