import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dashboardService } from '@/api/services/dashboard.service'
import { getErrorMessage } from '@/api/axios'
import type { Order, LoadingState } from '@/types'
import { createInitialLoadingState } from '@/types'

interface DashboardState extends LoadingState {
  activeOrders: Order[]
  stats: {
    totalActive: number
    totalPlanned: number
    totalFinished: number
    totalCancelled: number
  }
  lastUpdate: string | null
}

const initialState: DashboardState = {
  ...createInitialLoadingState(),
  activeOrders: [],
  stats: {
    totalActive: 0,
    totalPlanned: 0,
    totalFinished: 0,
    totalCancelled: 0,
  },
  lastUpdate: null,
}

// Async thunks
export const fetchActiveOrders = createAsyncThunk(
  'dashboard/fetchActiveOrders',
  async (clientId: number | undefined, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getActiveOrders(clientId)
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (clientId: number | undefined, { rejectWithValue }) => {
    try {
      const data = await dashboardService.getDashboardStats(clientId)
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch active orders
    builder.addCase(fetchActiveOrders.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchActiveOrders.fulfilled, (state, action) => {
      state.isLoading = false
      state.activeOrders = action.payload.sort((a: Order, b: Order) => {
        const priority: Record<string, number> = { red: 1, yellow: 2, green: 3 };
        const pA = priority[a.status_level || ''] || 4;
        const pB = priority[b.status_level || ''] || 4;
        return pA - pB;
      });
      state.lastUpdate = new Date().toISOString()
      state.error = null
    })
    builder.addCase(fetchActiveOrders.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Fetch stats
    builder.addCase(fetchDashboardStats.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      state.isLoading = false
      state.stats = action.payload
      state.error = null
    })
    builder.addCase(fetchDashboardStats.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
