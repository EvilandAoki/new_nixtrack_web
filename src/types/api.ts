// Tipos para las respuestas de API y requests

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
    role_id: number
    client_id: number
    is_active: number
  }
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  document_id?: string
  phone?: string
  position?: string
  client_id?: number
  role_id?: number
  city_code?: string
}

// Query params para listados
export interface BaseQueryParams {
  page?: number
  limit?: number
  search?: string
  is_active?: 0 | 1
}

export interface UserQueryParams extends BaseQueryParams {
  client_id?: number
  role_id?: number
}

export interface VehicleQueryParams extends BaseQueryParams {
  client_id?: number
  is_escort_vehicle?: 0 | 1
}

export interface OrderQueryParams extends BaseQueryParams {
  client_id?: number
  status_id?: number
  vehicle_id?: number
  license_plate?: string
  date_from?: string
  date_to?: string
}

export interface OrderDetailQueryParams {
  shipment_id: number
  page?: number
  limit?: number
}
