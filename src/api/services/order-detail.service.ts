import axiosInstance from '../axios'
import type { OrderDetail, OrderDetailFormData, ApiResponse } from '@/types'

export const orderDetailService = {
  /**
   * Obtener detalles/reportes de una orden
   */
  getOrderDetails: async (orderId: number) => {
    const response = await axiosInstance.get<ApiResponse<OrderDetail[]>>(
      `/order-details/${orderId}`
    )
    return response.data.data
  },

  /**
   * Obtener detalle por ID
   */
  getOrderDetailById: async (id: number) => {
    const response = await axiosInstance.get<ApiResponse<OrderDetail>>(`/order-details/detail/${id}`)
    return response.data.data
  },

  /**
   * Crear nuevo reporte/detalle
   */
  createOrderDetail: async (data: OrderDetailFormData) => {
    const response = await axiosInstance.post<ApiResponse<OrderDetail>>('/order-details', data)
    return response.data.data
  },

  /**
   * Actualizar reporte/detalle existente
   */
  updateOrderDetail: async (id: number, data: Partial<OrderDetailFormData>) => {
    const response = await axiosInstance.put<ApiResponse<OrderDetail>>(
      `/order-details/${id}`,
      data
    )
    return response.data.data
  },

  /**
   * Eliminar reporte/detalle (soft delete)
   */
  deleteOrderDetail: async (id: number) => {
    await axiosInstance.delete(`/order-details/${id}`)
  },

  /**
   * Crear reporte con archivos
   */
  createOrderDetailWithFiles: async (
    data: OrderDetailFormData,
    files: File[]
  ): Promise<OrderDetail> => {
    // Primero crear el reporte
    const detail = await orderDetailService.createOrderDetail(data)

    // Luego subir los archivos si existen
    if (files && files.length > 0) {
      for (const file of files) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('detail_id', String(detail.id))
          formData.append('description', '')

          await axiosInstance.post('/files/order-details', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } catch (error) {
          console.error('Error subiendo archivo:', error)
        }
      }
    }

    return detail
  },
}
