import axiosInstance from '../axios'
import type { Order, ApiResponse } from '@/types'

export const dashboardService = {
  getActiveOrders: async (clientId?: number): Promise<Order[]> => {
    const params = clientId ? { client_id: clientId } : {}
    const response = await axiosInstance.get<ApiResponse<Order[]>>('/dashboard', { params })
    return response.data.data || []
  },

  getDashboardStats: async (_clientId?: number) => {
    // TODO: Implement when backend endpoint exists
    return {
      totalActive: 0,
      totalPlanned: 0,
      totalFinished: 0,
      totalCancelled: 0,
    }
  },
}
