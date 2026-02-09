import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { vehicleService } from '@/api/services/vehicle.service'
import type { EntityState, Vehicle } from '@/types'
import { createInitialEntityState } from '@/types'
import { message } from 'antd'

interface VehiclesState extends EntityState<Vehicle> {
  escortVehicles: Vehicle[]
}

const initialState: VehiclesState = {
  ...createInitialEntityState<Vehicle>(),
  escortVehicles: [],
}

// ============= Async Thunks =============

/**
 * Obtener lista de vehículos
 */
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (
    params: {
      page?: number
      limit?: number
      search?: string
      is_active?: 0 | 1
      is_escort_vehicle?: 0 | 1
      client_id?: number
    } = {}
  ) => {
    return await vehicleService.getVehicles(params)
  }
)

/**
 * Obtener vehículo por ID
 */
export const fetchVehicleById = createAsyncThunk(
  'vehicles/fetchVehicleById',
  async (id: number) => {
    return await vehicleService.getVehicleById(id)
  }
)

/**
 * Crear nuevo vehículo
 */
export const createVehicle = createAsyncThunk(
  'vehicles/createVehicle',
  async (data: Parameters<typeof vehicleService.createVehicle>[0], { rejectWithValue }) => {
    try {
      const result = await vehicleService.createVehicle(data)
      message.success('Vehículo creado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear vehículo'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Actualizar vehículo existente
 */
export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async (
    { id, data }: { id: number; data: Parameters<typeof vehicleService.updateVehicle>[1] },
    { rejectWithValue }
  ) => {
    try {
      const result = await vehicleService.updateVehicle(id, data)
      message.success('Vehículo actualizado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar vehículo'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Eliminar vehículo
 */
export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (id: number, { rejectWithValue }) => {
    try {
      await vehicleService.deleteVehicle(id)
      message.success('Vehículo eliminado exitosamente')
      return id
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar vehículo'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Obtener vehículos de escolta
 */
export const fetchEscortVehicles = createAsyncThunk(
  'vehicles/fetchEscortVehicles',
  async () => {
    return await vehicleService.getEscortVehicles()
  }
)

// ============= Slice =============

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSelected: (state) => {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    // Fetch vehicles
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar vehículos'
      })

    // Fetch vehicle by ID
    builder
      .addCase(fetchVehicleById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVehicleById.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchVehicleById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar vehículo'
      })

    // Create vehicle
    builder
      .addCase(createVehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al crear vehículo'
      })

    // Update vehicle
    builder
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al actualizar vehículo'
      })

    // Delete vehicle
    builder
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        if (state.pagination) {
          state.pagination.total -= 1
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al eliminar vehículo'
      })

    // Fetch escort vehicles
    builder
      .addCase(fetchEscortVehicles.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchEscortVehicles.fulfilled, (state, action) => {
        state.loading = false
        state.escortVehicles = action.payload
      })
      .addCase(fetchEscortVehicles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar vehículos de escolta'
      })
  },
})

export const { clearError, clearSelected } = vehiclesSlice.actions
export default vehiclesSlice.reducer
