import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '@/api/services/order.service'
import type { EntityState, Order } from '@/types'
import { createInitialEntityState } from '@/types'
import { message } from 'antd'

type OrdersState = EntityState<Order>

const initialState: OrdersState = createInitialEntityState<Order>()

// ============= Async Thunks =============

/**
 * Obtener lista de órdenes
 */
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (
    params: {
      page?: number
      limit?: number
      search?: string
      status_id?: number
      client_id?: number
      vehicle_id?: number
      date_from?: string
      date_to?: string
    } = {}
  ) => {
    return await orderService.getOrders(params)
  }
)

/**
 * Obtener orden por ID
 */
export const fetchOrderById = createAsyncThunk('orders/fetchOrderById', async (id: number) => {
  return await orderService.getOrderById(id)
})

/**
 * Crear nueva orden
 */
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (data: Parameters<typeof orderService.createOrder>[0], { rejectWithValue }) => {
    try {
      const result = await orderService.createOrder(data)
      message.success('Orden creada exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear orden'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Actualizar orden existente
 */
export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (
    { id, data }: { id: number; data: Parameters<typeof orderService.updateOrder>[1] },
    { rejectWithValue }
  ) => {
    try {
      const result = await orderService.updateOrder(id, data)
      message.success('Orden actualizada exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar orden'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Eliminar orden
 */
export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: number, { rejectWithValue }) => {
    try {
      await orderService.deleteOrder(id)
      message.success('Orden eliminada exitosamente')
      return id
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar orden'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Finalizar orden
 */
export const finalizeOrder = createAsyncThunk(
  'orders/finalizeOrder',
  async ({ id, arrivalDate }: { id: number; arrivalDate: string }, { rejectWithValue }) => {
    try {
      const result = await orderService.finalizeOrder(id, arrivalDate)
      message.success('Orden finalizada exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al finalizar orden'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Cancelar orden
 */
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      const result = await orderService.cancelOrder(id, reason)
      message.success('Orden cancelada exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al cancelar orden'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Activar orden
 */
export const activateOrder = createAsyncThunk(
  'orders/activateOrder',
  async (id: number, { rejectWithValue }) => {
    try {
      const result = await orderService.activateOrder(id)
      message.success('Orden activada exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al activar orden'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Obtener órdenes activas
 */
export const fetchActiveOrders = createAsyncThunk('orders/fetchActiveOrders', async () => {
  return await orderService.getActiveOrders()
})

// ============= Slice =============

const ordersSlice = createSlice({
  name: 'orders',
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
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar órdenes'
      })

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar orden'
      })

    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al crear orden'
      })

    // Update order
    builder
      .addCase(updateOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al actualizar orden'
      })

    // Delete order
    builder
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        if (state.pagination) {
          state.pagination.total -= 1
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al eliminar orden'
      })

    // Finalize, Cancel, Activate orders - actualizan el estado
    builder
      .addCase(finalizeOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
      .addCase(activateOrder.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
  },
})

export const { clearError, clearSelected } = ordersSlice.actions
export default ordersSlice.reducer
