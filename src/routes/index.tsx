import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAppSelector } from '@/store/hooks'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/pages/auth/LoginPage'
import RecoverPasswordPage from '@/pages/auth/RecoverPasswordPage'
import UsersPage from '@/pages/users/UsersPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ClientsPage from '@/pages/clients/ClientsPage'
import VehiclesPage from '@/pages/vehicles/VehiclesPage'
import VehicleDetailPage from '@/pages/vehicles/VehicleDetailPage'
import AgentsPage from '@/pages/agents/AgentsPage'
import OrdersPage from '@/pages/orders/OrdersPage'
import OrderDetailPage from '@/pages/orders/OrderDetailPage'
import OrderFormPage from '@/pages/orders/OrderFormPage'

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <MainLayout>{children}</MainLayout>
}

// Main Routes component
const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/recover-password" element={<RecoverPasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <VehiclesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:id"
        element={
          <ProtectedRoute>
            <VehicleDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents"
        element={
          <ProtectedRoute>
            <AgentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/new"
        element={
          <ProtectedRoute>
            <OrderFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id/edit"
        element={
          <ProtectedRoute>
            <OrderFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
