import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { ApolloProvider } from '@apollo/client'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { vi } from 'vitest'

// Import reducers
import commonRedux from 'config/redux/common/reducer'
import themeRedux from 'config/redux/theme/reducer'

// Mock de locales
const mockLocales = {
  'app.common.save': 'Guardar',
  'app.common.cancel': 'Cancelar',
  'app.common.delete': 'Eliminar',
  'app.common.edit': 'Editar',
}

// Mock simple del authRedux para tests
const mockAuthReducer = (state = { user: null, loading: false, error: null }, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, loading: false }
    case 'AUTH_LOADING':
      return { ...state, loading: true }
    case 'AUTH_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

// Crear store de prueba
export function createTestStore(preloadedState = {}) {
  const rootReducer = combineReducers({
    authRedux: mockAuthReducer,
    themeRedux,
    commonRedux,
  })

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: false,
      }),
  })
}

// Mock Apollo Client
const createMockApolloClient = () => ({
  query: vi.fn(),
  mutate: vi.fn(),
  watchQuery: vi.fn(),
  readQuery: vi.fn(),
  writeQuery: vi.fn(),
  resetStore: vi.fn(),
})

/**
 * Wrapper personalizado para renderizar componentes con todos los providers
 */
function AllTheProviders({ children, store, apolloClient }) {
  const testStore = store || createTestStore()
  const testApolloClient = apolloClient || createMockApolloClient()

  return (
    <Provider store={testStore}>
      <ApolloProvider client={testApolloClient}>
        <BrowserRouter>
          <IntlProvider locale="es" messages={mockLocales}>
            {children}
          </IntlProvider>
        </BrowserRouter>
      </ApolloProvider>
    </Provider>
  )
}

/**
 * Custom render que incluye todos los providers necesarios
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    apolloClient = createMockApolloClient(),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <AllTheProviders store={store} apolloClient={apolloClient}>
        {children}
      </AllTheProviders>
    )
  }

  return {
    store,
    apolloClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

// Re-exportar todo de testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
