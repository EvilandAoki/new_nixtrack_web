import axiosInstance from '../axios'
import type { Role, ApiResponse } from '@/types'

export const roleService = {
    /**
     * Obtener lista de roles
     */
    getRoles: async () => {
        const response = await axiosInstance.get<ApiResponse<Role[]>>('/roles')
        // Handle both wrapped in data and direct array if API differs
        return response.data.data || response.data
    },

    /**
     * Obtener rol por ID
     */
    getRoleById: async (id: number) => {
        const response = await axiosInstance.get<ApiResponse<Role>>(`/roles/${id}`)
        return response.data.data
    },
}
