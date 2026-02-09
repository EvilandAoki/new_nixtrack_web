import axiosInstance from '../axios'
import type { Vehicle, VehicleFormData, ApiResponse, PaginatedResponse } from '@/types'

export const vehicleService = {
  /**
   * Obtener lista de vehículos con paginación y filtros
   */
  getVehicles: async (params: {
    page?: number
    limit?: number
    search?: string
    is_active?: 0 | 1
    is_escort_vehicle?: 0 | 1
    client_id?: number
  } = {}) => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Vehicle>>>(
      '/vehicles',
      { params }
    )
    const data = response.data.data
    // Transform backend response to match expected format
    return {
      items: data.items,
      pagination: {
        current_page: data.page,
        per_page: data.limit,
        total: data.total,
        total_pages: Math.ceil(data.total / data.limit)
      }
    }
  },

  /**
   * Obtener vehículo por ID
   */
  getVehicleById: async (id: number) => {
    const response = await axiosInstance.get<ApiResponse<Vehicle>>(`/vehicles/${id}`)
    return response.data.data
  },

  /**
   * Crear nuevo vehículo
   */
  createVehicle: async (data: VehicleFormData) => {
    const response = await axiosInstance.post<ApiResponse<Vehicle>>('/vehicles', data)
    return response.data.data
  },

  /**
   * Actualizar vehículo existente
   */
  updateVehicle: async (id: number, data: Partial<VehicleFormData>) => {
    const response = await axiosInstance.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, data)
    return response.data.data
  },

  /**
   * Eliminar vehículo (soft delete)
   */
  deleteVehicle: async (id: number) => {
    await axiosInstance.delete(`/vehicles/${id}`)
  },

  /**
   * Obtener vehículos de escolta (para selector de escoltas/acompañantes)
   */
  getEscortVehicles: async () => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Vehicle>>>('/vehicles', {
      params: { is_escort_vehicle: 1, is_active: 1, limit: 1000 },
    })
    return response.data.data.items
  },

  /**
   * Obtener historial de servicios de un vehículo
   */
  getVehicleHistory: async (id: number) => {
    const response = await axiosInstance.get<ApiResponse<any[]>>(`/vehicles/${id}/history`)
    return response.data.data
  },

  /**
   * Verificar si una placa ya existe
   */
  checkLicensePlateExists: async (licensePlate: string, excludeId?: number) => {
    const params = excludeId ? { exclude_id: excludeId } : {}
    const response = await axiosInstance.get<ApiResponse<{ exists: boolean }>>(
      `/vehicles/check-license-plate/${licensePlate}`,
      { params }
    )
    return response.data.data.exists
  },
}
