import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { clientService } from '@/api/services/client.service'
import type { EntityState, Client } from '@/types'
import { createInitialEntityState } from '@/types'
import { message } from 'antd'

type ClientsState = EntityState<Client>

const initialState: ClientsState = createInitialEntityState<Client>()

// ============= Async Thunks =============

/**
 * Obtener lista de clientes
 */
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params: { page?: number; limit?: number; search?: string; is_active?: 0 | 1 } = {}) => {
    return await clientService.getClients(params)
  }
)

/**
 * Obtener cliente por ID
 */
export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (id: number) => {
    return await clientService.getClientById(id)
  }
)

/**
 * Crear nuevo cliente
 */
export const createClient = createAsyncThunk(
  'clients/createClient',
  async (data: Parameters<typeof clientService.createClient>[0], { rejectWithValue }) => {
    try {
      const result = await clientService.createClient(data)
      message.success('Cliente creado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear cliente'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Actualizar cliente existente
 */
export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async (
    { id, data }: { id: number; data: Parameters<typeof clientService.updateClient>[1] },
    { rejectWithValue }
  ) => {
    try {
      const result = await clientService.updateClient(id, data)
      message.success('Cliente actualizado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar cliente'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Eliminar cliente
 */
export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: number, { rejectWithValue }) => {
    try {
      await clientService.deleteClient(id)
      message.success('Cliente eliminado exitosamente')
      return id
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar cliente'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

// ============= Slice =============

const clientsSlice = createSlice({
  name: 'clients',
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
    // Fetch clients
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar clientes'
      })

    // Fetch client by ID
    builder
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar cliente'
      })

    // Create client
    builder
      .addCase(createClient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false
        // Agregar el nuevo cliente a la lista
        state.items.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al crear cliente'
      })

    // Update client
    builder
      .addCase(updateClient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false
        // Actualizar el cliente en la lista
        const index = state.items.findIndex((item) => item.id_client === action.payload.id_client)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id_client === action.payload.id_client) {
          state.selected = action.payload
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al actualizar cliente'
      })

    // Delete client
    builder
      .addCase(deleteClient.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false
        // Remover el cliente de la lista
        state.items = state.items.filter((item) => item.id_client !== action.payload)
        if (state.pagination) {
          state.pagination.total -= 1
        }
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al eliminar cliente'
      })
  },
})

export const { clearError, clearSelected } = clientsSlice.actions
export default clientsSlice.reducer
