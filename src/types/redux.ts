// Tipos para Redux state

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface Pagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

export interface EntityState<T> {
  items: T[]
  selected: T | null
  loading: boolean
  error: string | null
  pagination: Pagination | null
}

export interface AuthState extends LoadingState {
  user: {
    id: number
    name: string
    email: string
    role_id: number
    client_id: number
    is_active: number
  } | null
  token: string | null
  isAuthenticated: boolean
}

// Helpers para crear estados iniciales
export const createInitialEntityState = <T>(): EntityState<T> => ({
  items: [],
  selected: null,
  loading: false,
  error: null,
  pagination: null,
})

export const createInitialLoadingState = (): LoadingState => ({
  isLoading: false,
  error: null,
})
