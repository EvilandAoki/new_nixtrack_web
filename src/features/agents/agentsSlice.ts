import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { agentService } from '@/api/services/agent.service'
import type { EntityState, Agent } from '@/types'
import { createInitialEntityState } from '@/types'
import { message } from 'antd'

type AgentsState = EntityState<Agent>

const initialState: AgentsState = createInitialEntityState<Agent>()

// ============= Async Thunks =============

/**
 * Obtener lista de escoltas
 */
export const fetchAgents = createAsyncThunk(
  'agents/fetchAgents',
  async (
    params: {
      page?: number
      limit?: number
      search?: string
      is_active?: 0 | 1
    } = {}
  ) => {
    return await agentService.getAgents(params)
  }
)

/**
 * Obtener escolta por ID
 */
export const fetchAgentById = createAsyncThunk('agents/fetchAgentById', async (id: number) => {
  return await agentService.getAgentById(id)
})

/**
 * Crear nuevo escolta
 */
export const createAgent = createAsyncThunk(
  'agents/createAgent',
  async (data: Parameters<typeof agentService.createAgent>[0], { rejectWithValue }) => {
    try {
      const result = await agentService.createAgent(data)
      message.success('Escolta creado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al crear escolta'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Actualizar escolta existente
 */
export const updateAgent = createAsyncThunk(
  'agents/updateAgent',
  async (
    { id, data }: { id: number; data: Parameters<typeof agentService.updateAgent>[1] },
    { rejectWithValue }
  ) => {
    try {
      const result = await agentService.updateAgent(id, data)
      message.success('Escolta actualizado exitosamente')
      return result
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar escolta'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

/**
 * Eliminar escolta
 */
export const deleteAgent = createAsyncThunk(
  'agents/deleteAgent',
  async (id: number, { rejectWithValue }) => {
    try {
      await agentService.deleteAgent(id)
      message.success('Escolta eliminado exitosamente')
      return id
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al eliminar escolta'
      message.error(errorMsg)
      return rejectWithValue(errorMsg)
    }
  }
)

// ============= Slice =============

const agentsSlice = createSlice({
  name: 'agents',
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
    // Fetch agents
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.pagination = action.payload.pagination
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar escoltas'
      })

    // Fetch agent by ID
    builder
      .addCase(fetchAgentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.loading = false
        state.selected = action.payload
      })
      .addCase(fetchAgentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Error al cargar escolta'
      })

    // Create agent
    builder
      .addCase(createAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
        if (state.pagination) {
          state.pagination.total += 1
        }
      })
      .addCase(createAgent.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al crear escolta'
      })

    // Update agent
    builder
      .addCase(updateAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload
        }
      })
      .addCase(updateAgent.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al actualizar escolta'
      })

    // Delete agent
    builder
      .addCase(deleteAgent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter((item) => item.id !== action.payload)
        if (state.pagination) {
          state.pagination.total -= 1
        }
      })
      .addCase(deleteAgent.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Error al eliminar escolta'
      })
  },
})

export const { clearError, clearSelected } = agentsSlice.actions
export default agentsSlice.reducer
