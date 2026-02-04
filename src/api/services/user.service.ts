import axiosInstance from '../axios'
import type {
  User,
  UserFormData,
  ApiResponse,
  PaginatedResponse,
  UserQueryParams,
} from '@/types'

// Helper to transform backend user data to frontend format
const transformUser = (user: any): User => {
  return {
    ...user,
    // Transform role_name to role object
    role: user.role_name ? { 
      id_role: user.role_id,
      name: user.role_name,
      is_admin: user.is_admin 
    } : undefined,
    // Transform client_name to client object
    client: user.client_name ? {
      id_client: user.client_id,
      company_name: user.client_name
    } : undefined,
  }
}

export const userService = {
  getUsers: async (params: UserQueryParams = {}): Promise<PaginatedResponse<User>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<User>>>(
      '/users',
      { params }
    )
    const data = response.data.data
    // Transform users to include nested objects
    return {
      ...data,
      items: data.items.map(transformUser)
    }
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`)
    return transformUser(response.data.data)
  },

  createUser: async (userData: UserFormData & { password: string }): Promise<User> => {
    const response = await axiosInstance.post<ApiResponse<User>>('/users', userData)
    return transformUser(response.data.data)
  },

  updateUser: async (id: number, userData: Partial<UserFormData>): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, userData)
    return transformUser(response.data.data)
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`)
  },

  deactivateUser: async (id: number): Promise<User> => {
    const response = await axiosInstance.patch<ApiResponse<User>>(`/users/${id}/deactivate`)
    return response.data.data
  },
}
