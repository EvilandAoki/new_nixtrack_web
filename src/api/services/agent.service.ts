import axiosInstance from '../axios'
import type { Agent, AgentFormData, ApiResponse, PaginatedResponse } from '@/types'

export const agentService = {
  /**
   * Obtener lista de escoltas/acompañantes con paginación y filtros
   */
  getAgents: async (params: {
    page?: number
    limit?: number
    search?: string
    is_active?: 0 | 1
  } = {}) => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Agent>>>(
      '/agents',
      { params }
    )
    return response.data.data
  },

  /**
   * Obtener escolta por ID
   */
  getAgentById: async (id: number) => {
    const response = await axiosInstance.get<ApiResponse<Agent>>(`/agents/${id}`)
    return response.data.data
  },

  /**
   * Crear nuevo escolta
   */
  createAgent: async (data: AgentFormData) => {
    const response = await axiosInstance.post<ApiResponse<Agent>>('/agents', data)
    return response.data.data
  },

  /**
   * Actualizar escolta existente
   */
  updateAgent: async (id: number, data: Partial<AgentFormData>) => {
    const response = await axiosInstance.put<ApiResponse<Agent>>(`/agents/${id}`, data)
    return response.data.data
  },

  /**
   * Eliminar escolta (soft delete)
   */
  deleteAgent: async (id: number) => {
    await axiosInstance.delete(`/agents/${id}`)
  },

  /**
   * Verificar si un documento ya existe
   */
  checkDocumentExists: async (documentId: string, excludeId?: number) => {
    const params = excludeId ? { exclude_id: excludeId } : {}
    const response = await axiosInstance.get<ApiResponse<{ exists: boolean }>>(
      `/agents/check-document/${documentId}`,
      { params }
    )
    return response.data.data.exists
  },
}
