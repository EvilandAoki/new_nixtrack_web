import axiosInstance from '../axios'
import type { Client, ClientFormData, ApiResponse, PaginatedResponse } from '@/types'

export const clientService = {
  /**
   * Obtener lista de clientes con paginación y filtros
   */
  getClients: async (params: {
    page?: number
    limit?: number
    search?: string
    is_active?: 0 | 1
  } = {}) => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Client>>>(
      '/clients',
      { params }
    )
    return response.data.data
  },

  /**
   * Obtener cliente por ID
   */
  getClientById: async (id: number) => {
    const response = await axiosInstance.get<ApiResponse<Client>>(`/clients/${id}`)
    return response.data.data
  },

  /**
   * Crear nuevo cliente
   */
  createClient: async (data: ClientFormData) => {
    const response = await axiosInstance.post<ApiResponse<Client>>('/clients', data)
    return response.data.data
  },

  /**
   * Actualizar cliente existente
   */
  updateClient: async (id: number, data: Partial<ClientFormData>) => {
    const response = await axiosInstance.put<ApiResponse<Client>>(`/clients/${id}`, data)
    return response.data.data
  },

  /**
   * Eliminar cliente (soft delete)
   */
  deleteClient: async (id: number) => {
    await axiosInstance.delete(`/clients/${id}`)
  },

  /**
   * Verificar si un NIT ya existe
   */
  checkTaxIdExists: async (taxId: string, excludeId?: number) => {
    const params = excludeId ? { exclude_id: excludeId } : {}
    const response = await axiosInstance.get<ApiResponse<{ exists: boolean }>>(
      `/clients/check-tax-id/${taxId}`,
      { params }
    )
    return response.data.data.exists
  },
}
