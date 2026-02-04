import axiosInstance from '../axios'
import type { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '@/types'

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    )
    return response.data.data
  },

  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/auth/register',
      userData
    )
    return response.data.data
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get<ApiResponse<LoginResponse['user']>>(
      '/auth/profile'
    )
    return response.data.data
  },

  logout: async () => {
    // Optional: call backend to invalidate token
    // await axiosInstance.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}
