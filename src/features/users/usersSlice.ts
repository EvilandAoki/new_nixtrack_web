import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userService } from '@/api/services/user.service'
import { getErrorMessage } from '@/api/axios'
import type { EntityState, User, UserFormData, UserQueryParams } from '@/types'
import { createInitialEntityState } from '@/types'

type UsersState = EntityState<User>

const initialState: UsersState = createInitialEntityState<User>()

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: UserQueryParams = {}, { rejectWithValue }) => {
    try {
      const data = await userService.getUsers(params)
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await userService.getUserById(id)
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: UserFormData & { password: string }, { rejectWithValue }) => {
    try {
      const data = await userService.createUser(userData)
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (
    { id, userData }: { id: number; userData: Partial<UserFormData> },
    { rejectWithValue }
  ) => {
    try {
      const data = await userService.updateUser(id, userData)
      return data
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id)
      return id
    } catch (error) {
      return rejectWithValue(getErrorMessage(error))
    }
  }
)

// Slice
const usersSlice = createSlice({
  name: 'users',
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
    // Fetch users
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.loading = false
      state.items = action.payload.items
      state.pagination = {
        current_page: action.payload.page,
        per_page: action.payload.limit,
        total: action.payload.total,
        total_pages: action.payload.totalPages,
      }
      state.error = null
    })
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Fetch user by id
    builder.addCase(fetchUserById.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(fetchUserById.fulfilled, (state, action) => {
      state.loading = false
      state.selected = action.payload
      state.error = null
    })
    builder.addCase(fetchUserById.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Create user
    builder.addCase(createUser.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.loading = false
      state.items.unshift(action.payload)
      if (state.pagination) {
        state.pagination.total += 1
      }
      state.error = null
    })
    builder.addCase(createUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Update user
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.loading = false
      const index = state.items.findIndex((item) => item.id === action.payload.id)
      if (index !== -1) {
        state.items[index] = action.payload
      }
      if (state.selected?.id === action.payload.id) {
        state.selected = action.payload
      }
      state.error = null
    })
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })

    // Delete user
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.loading = false
      state.items = state.items.filter((item) => item.id !== action.payload)
      if (state.pagination) {
        state.pagination.total -= 1
      }
      state.error = null
    })
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload as string
    })
  },
})

export const { clearError, clearSelected } = usersSlice.actions
export default usersSlice.reducer
