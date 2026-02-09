import axiosInstance from '../axios'
import type { Department, City, TrackStatus, ApiResponse } from '@/types'

export const catalogService = {
  /**
   * Obtener lista de departamentos
   */
  getDepartments: async (countryCode?: string) => {
    const params = countryCode ? { country_code: countryCode } : {}
    const response = await axiosInstance.get<ApiResponse<Department[]>>('/catalog/departments', {
      params,
    })
    return response.data.data
  },

  /**
   * Obtener lista de ciudades
   */
  getCities: async (params: { department_code?: string; search?: string } = {}) => {
    const response = await axiosInstance.get<ApiResponse<City[]>>('/catalog/cities', { params })
    return response.data.data
  },

  /**
   * Obtener una ciudad por ID
   */
  getCityById: async (cityId: number) => {
    const response = await axiosInstance.get<ApiResponse<City>>(`/catalog/cities/${cityId}`)
    return response.data.data
  },

  /**
   * Obtener estados de seguimiento
   */
  getTrackStatuses: async () => {
    const response = await axiosInstance.get<ApiResponse<TrackStatus[]>>('/catalog/statuses')
    return response.data.data
  },

  /**
   * Obtener países (hardcoded o desde API si existe)
   */
  getCountries: async () => {
    // Por ahora retornamos Colombia hardcoded
    // Si el backend tiene endpoint de países, usar ese
    return [
      { code: 'CO', name: 'Colombia' },
      // Agregar más países según necesidad
    ]
  },
}
