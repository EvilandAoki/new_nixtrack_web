import axiosInstance from '../axios'
import type { VehicleFile, OrderFile, OrderDetailFile, ApiResponse } from '@/types'

export const fileService = {
  // ============= Vehicle Files =============

  /**
   * Obtener archivos de un vehículo
   */
  getVehicleFiles: async (vehicleId: number) => {
    const response = await axiosInstance.get<ApiResponse<VehicleFile[]>>(
      `/vehicles/${vehicleId}/files`
    )
    return response.data.data
  },

  /**
   * Subir archivo para un vehículo
   */
  uploadVehicleFile: async (
    vehicleId: number,
    file: File,
    description: string = '',
    isMainPhoto: boolean = false
  ) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('vehicle_id', String(vehicleId))
    formData.append('description', description)
    formData.append('is_main_photo', isMainPhoto ? '1' : '0')

    const response = await axiosInstance.post<ApiResponse<VehicleFile>>(
      `/vehicles/${vehicleId}/files`,
      formData
    )
    return response.data.data
  },

  /**
   * Eliminar archivo de vehículo
   * @param vehicleId El ID del vehículo
   * @param fileId El ID del archivo
   */
  deleteVehicleFile: async (vehicleId: number, fileId: number) => {
    await axiosInstance.delete(`/vehicles/${vehicleId}/files/${fileId}`)
  },

  /**
   * Establecer foto principal de vehículo
   */
  setMainVehiclePhoto: async (vehicleId: number, fileId: number) => {
    const response = await axiosInstance.put<ApiResponse<VehicleFile>>(
      `/vehicles/${vehicleId}/files/${fileId}/main`
    )
    return response.data.data
  },

  // ============= Order Files =============

  /**
   * Obtener archivos de una orden
   */
  getOrderFiles: async (orderId: number) => {
    const response = await axiosInstance.get<ApiResponse<OrderFile[]>>(`/orders/${orderId}/files`)
    return response.data.data
  },

  /**
   * Subir archivo para una orden
   */
  uploadOrderFile: async (orderId: number, file: File, description: string = '') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('order_id', String(orderId))
    formData.append('description', description)

    const response = await axiosInstance.post<ApiResponse<OrderFile>>(
      `/orders/${orderId}/files`,
      formData
    )
    return response.data.data
  },

  /**
   * Eliminar archivo de orden
   */
  deleteOrderFile: async (orderId: number, fileId: number) => {
    await axiosInstance.delete(`/orders/${orderId}/files/${fileId}`)
  },

  // ============= Order Detail Files =============

  /**
   * Obtener archivos de un detalle de orden
   */
  getOrderDetailFiles: async (orderId: number, detailId: number) => {
    const response = await axiosInstance.get<ApiResponse<OrderDetailFile[]>>(
      `/orders/${orderId}/details/${detailId}/files`
    )
    return response.data.data
  },

  /**
   * Subir archivo para un detalle de orden
   */
  uploadOrderDetailFile: async (orderId: number, detailId: number, file: File, description: string = '') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('detail_id', String(detailId))
    formData.append('description', description)

    const response = await axiosInstance.post<ApiResponse<OrderDetailFile>>(
      `/orders/${orderId}/details/${detailId}/files`,
      formData
    )
    return response.data.data
  },

  /**
   * Eliminar archivo de detalle de orden
   */
  deleteOrderDetailFile: async (orderId: number, detailId: number, fileId: number) => {
    await axiosInstance.delete(`/orders/${orderId}/details/${detailId}/files/${fileId}`)
  },
}
