import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/authSlice'
import usersReducer from '@/features/users/usersSlice'
import dashboardReducer from '@/features/dashboard/dashboardSlice'
import clientsReducer from '@/features/clients/clientsSlice'
import vehiclesReducer from '@/features/vehicles/vehiclesSlice'
import agentsReducer from '@/features/agents/agentsSlice'
import ordersReducer from '@/features/orders/ordersSlice'
import orderDetailsReducer from '@/features/orders/orderDetailsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    dashboard: dashboardReducer,
    clients: clientsReducer,
    vehicles: vehiclesReducer,
    agents: agentsReducer,
    orders: ordersReducer,
    orderDetails: orderDetailsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
