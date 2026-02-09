import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { catalogService } from '@/api/services/catalog.service'
import type { City, Department, TrackStatus } from '@/types'
import { getErrorMessage } from '@/api/axios'

interface CatalogState {
    departments: Department[]
    cities: City[]
    statuses: TrackStatus[]
    loading: boolean
    error: string | null
}

const initialState: CatalogState = {
    departments: [],
    cities: [],
    statuses: [],
    loading: false,
    error: null,
}

// Async thunks
export const fetchDepartments = createAsyncThunk(
    'catalog/fetchDepartments',
    async (countryCode: string | undefined, { rejectWithValue }) => {
        try {
            const data = await catalogService.getDepartments(countryCode)
            return data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error))
        }
    }
)

export const fetchCities = createAsyncThunk(
    'catalog/fetchCities',
    async (params: Parameters<typeof catalogService.getCities>[0] | undefined, { rejectWithValue }) => {
        try {
            const data = await catalogService.getCities(params)
            return data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error))
        }
    }
)

export const fetchTrackStatuses = createAsyncThunk(
    'catalog/fetchTrackStatuses',
    async (_, { rejectWithValue }) => {
        try {
            const data = await catalogService.getTrackStatuses()
            return data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error))
        }
    }
)

const catalogSlice = createSlice({
    name: 'catalog',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        // Departments
        builder.addCase(fetchDepartments.pending, (state) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(fetchDepartments.fulfilled, (state, action) => {
            state.loading = false
            state.departments = action.payload
        })
        builder.addCase(fetchDepartments.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })

        // Cities
        builder.addCase(fetchCities.pending, (state) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(fetchCities.fulfilled, (state, action) => {
            state.loading = false
            state.cities = action.payload
        })
        builder.addCase(fetchCities.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })

        // Track Statuses
        builder.addCase(fetchTrackStatuses.pending, (state) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(fetchTrackStatuses.fulfilled, (state, action) => {
            state.loading = false
            state.statuses = action.payload
        })
        builder.addCase(fetchTrackStatuses.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload as string
        })
    },
})

export const { clearError } = catalogSlice.actions
export default catalogSlice.reducer
