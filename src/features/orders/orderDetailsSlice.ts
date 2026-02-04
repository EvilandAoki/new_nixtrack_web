import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderDetailService } from '@/api/services/order-detail.service'
import type { OrderDetail } from '@/types'
import { message } from 'antd'

interface OrderDetailsState {
  items: OrderDetail[]
  loading: boolean
  error: string | null
  selected: OrderDetail | null
}

const initialState: OrderDetailsState = {
  items: [],
  loading: false,
  error: null,
  selected: null,
}

// ============= Async Thunks =============

/**
 * Obtener detalles de una orden
 */
export const fetchOrderDetails = createAsyncThunk(
  'orderDetails/fetchOrderDetails',
  async (orderId: number) => {
    return await orderDetailService.getOrderDetails(orderId)
  }
)

/**
 * Obtener detalle por ID
 */
export const fetchOrderDetailById = createAsyncThunk(
  'orderDetails/fetchOrderDetailById',
  async (id: number) => {
    return await orderDetailService.getOrderDetailById(id)
  }
)

/**
 * Crear nuevo detalle/reporte
 */
export const createOrderDetail = createAsyncThunk(
  'orderDetails/createOrderDetail',
  async (
    { data, files }: { data: Parameters<typeof orderDetailService.createOrderDetail>[0]; files?: File[] },
    { rejectWithValue }
  ) => {
    try {
      let result
      if (files && files.length > 0) {
        result = await orderDetailService.createOrderDetailWithFiles(data, files)
      } else {
        result = await orderDetailService.createOrderDetail(data)
      }
      message.success('Reporte creado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear reporte'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Actualizar detalle existente
 */
export const updateOrderDetail = createAsyncThunk(
  'orderDetails/updateOrderDetail',
  async (
    { id, data }: { id: number; data: Parameters<typeof orderDetailService.updateOrderDetail>[1] },
    { rejectWithValue }
  ) => {
    try {
      const result = await orderDetailService.updateOrderDetail(id, data)
      message.success('Reporte actualizado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar reporte'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Eliminar detalle
 */
export const deleteOrderDetail = createAsyncThunk(
  'orderDetails/deleteOrderDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      await orderDetailService.deleteOrderDetail(id)
      message.success('Reporte eliminado exitosamente')
      return id
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar reporte'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

// ============= Slice =============

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearDetails: (state) => {
      state.items = []
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    // Fetch order details
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar reportes'
      })

    // Fetch detail by ID
    builder
      .addCase(fetchOrderDetailById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetailById.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchOrderDetailById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar reporte'
      })

    // Create detail
    builder
      .addCase(createOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
      })
      .addCase(createOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al crear reporte'
      })

    // Update detail
    builder
      .addCase(updateOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
      .addCase(updateOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al actualizar reporte'
      })

    // Delete detail
    builder
      .addCase(deleteOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deleteOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al eliminar reporte'
      })
  },
})

export const { clearError, clearDetails } = orderDetailsSlice.actions
export default orderDetailsSlice.reducer
