import axiosInstance from '../axios'
import type { Order, OrderFormData, ApiResponse, PaginatedResponse } from '@/types'

export const orderService = {
  /**
   * Obtener lista de órdenes/seguimientos con paginación y filtros
   */
  getOrders: async (params: {
    page?: number
    limit?: number
    search?: string
    status_id?: number
    client_id?: number
    vehicle_id?: number
    date_from?: string
    date_to?: string
  } = {}) => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Order>>>(
      '/orders',
      { params }
    )
    return response.data.data
  },

  /**
   * Obtener orden por ID
   */
  getOrderById: async (id: number) => {
    const response = await axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data.data
  },

  /**
   * Crear nueva orden
   */
  createOrder: async (data: OrderFormData) => {
    const response = await axiosInstance.post<ApiResponse<Order>>('/orders', data)
    return response.data.data
  },

  /**
   * Actualizar orden existente
   */
  updateOrder: async (id: number, data: Partial<OrderFormData>) => {
    const response = await axiosInstance.put<ApiResponse<Order>>(`/orders/${id}`, data)
    return response.data.data
  },

  /**
   * Eliminar orden (soft delete)
   */
  deleteOrder: async (id: number) => {
    await axiosInstance.delete(`/orders/${id}`)
  },

  /**
   * Finalizar orden/seguimiento
   */
  finalizeOrder: async (id: number, arrivalDate: string) => {
    const response = await axiosInstance.put<ApiResponse<Order>>(`/orders/${id}/finalize`, {
      arrival_at: arrivalDate,
    })
    return response.data.data
  },

  /**
   * Cancelar orden
   */
  cancelOrder: async (id: number, reason: string) => {
    const response = await axiosInstance.put<ApiResponse<Order>>(`/orders/${id}/cancel`, {
      cancellation_reason: reason,
    })
    return response.data.data
  },

  /**
   * Activar orden (cambiar estado a activo)
   */
  activateOrder: async (id: number) => {
    const response = await axiosInstance.put<ApiResponse<Order>>(`/orders/${id}/activate`)
    return response.data.data
  },

  /**
   * Obtener órdenes activas (para dashboard)
   */
  getActiveOrders: async () => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Order>>>('/orders', {
      params: { status_id: 2, limit: 100 }, // Status 2 = Activo/En tránsito
    })
    return response.data.data.items
  },

  /**
   * Verificar si un número de orden ya existe
   */
  checkOrderNumberExists: async (orderNumber: string, excludeId?: number) => {
    const params = excludeId ? { exclude_id: excludeId } : {}
    const response = await axiosInstance.get<ApiResponse<{ exists: boolean }>>(
      `/orders/check-order-number/${orderNumber}`,
      { params }
    )
    return response.data.data.exists
  },
}
