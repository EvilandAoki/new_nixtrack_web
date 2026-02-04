import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService } from '@/api/services/auth.service'
import { getErrorMessage } from '@/api/axios'
import type { AuthState, LoginRequest, RegisterRequest } from '@/types'

// Initial state
const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
}

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      localStorage.setItem('user', JSON.stringify(user))
      return user
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
      return null
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.error = null
    })
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false
      state.user = action.payload
      state.isAuthenticated = true
      state.error = null
    })
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
      state.isAuthenticated = false
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    })

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isLoading = false
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    })
    builder.addCase(logoutUser.rejected, (state) => {
      state.isLoading = false
      // Even if logout fails, clear local state
      state.user = null
      state.token = null
      state.isAuthenticated = false
    })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
