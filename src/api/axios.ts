import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types'

const baseURL = 'https://nixtrack.ingeniosoft.net/api'
// Create axios instance
export const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  // Let axios handle Content-Type automatically based on the data sent
})

// Request interceptor - Add token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<ApiError>) => {
    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    // Handle 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Acceso denegado')
    }

    // Return error for handling in components
    return Promise.reject(error)
  }
)

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }
    if (axiosError.message) {
      return axiosError.message
    }
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Error desconocido'
}

export default axiosInstance
