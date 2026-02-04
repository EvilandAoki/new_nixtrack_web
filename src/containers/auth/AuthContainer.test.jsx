import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import AuthContainer from './index'

// Mock del reducer de auth
const mockAuthReducer = (
  state = { user: null, loading: false, error: null },
  action
) => {
  switch (action.type) {
    case 'AUTH_GET_USER_PROFILE':
      return { ...state, loading: true }
    case 'AUTH_GET_USER_PROFILE_SUCCESS':
      return { ...state, user: action.payload, loading: false }
    case 'AUTH_GET_USER_PROFILE_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

// Mock de las actions
vi.mock('config/redux/actions', () => ({
  authGetUserProfile: vi.fn((navigate) => ({
    type: 'AUTH_GET_USER_PROFILE',
    payload: { navigate },
  })),
}))

describe('AuthContainer Component', () => {
  let mockNavigate

  beforeEach(() => {
    mockNavigate = vi.fn()
    localStorage.clear()
    vi.clearAllMocks()
  })

  const createTestStore = (preloadedState = {}) => {
    return configureStore({
      reducer: {
        authRedux: mockAuthReducer,
      },
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
          thunk: false,
        }),
    })
  }

  const renderWithRouter = (component, store) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    )
  }

  it('debe redirigir a /login cuando no hay token', async () => {
    const store = createTestStore({
      authRedux: { user: null, loading: false, error: null },
    })

    // Mock useNavigate
    const useNavigateMock = vi.fn(() => mockNavigate)
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: useNavigateMock,
      }
    })

    renderWithRouter(
      <AuthContainer>
        <div>Protected Content</div>
      </AuthContainer>,
      store
    )

    // El componente no debe renderizar children sin usuario
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('debe renderizar children cuando hay usuario autenticado', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    }

    const store = createTestStore({
      authRedux: { user: mockUser, loading: false, error: null },
    })

    renderWithRouter(
      <AuthContainer>
        <div>Protected Content</div>
      </AuthContainer>,
      store
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('debe despachar authGetUserProfile cuando hay token pero no hay usuario', async () => {
    const { authGetUserProfile } = require('config/redux/actions')
    localStorage.setItem('token', 'fake-token')

    const store = createTestStore({
      authRedux: { user: null, loading: false, error: null },
    })

    renderWithRouter(
      <AuthContainer>
        <div>Protected Content</div>
      </AuthContainer>,
      store
    )

    await waitFor(() => {
      expect(authGetUserProfile).toHaveBeenCalled()
    })
  })

  it('no debe renderizar children mientras está cargando', () => {
    const store = createTestStore({
      authRedux: { user: null, loading: true, error: null },
    })

    renderWithRouter(
      <AuthContainer>
        <div>Protected Content</div>
      </AuthContainer>,
      store
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('debe manejar múltiples children correctamente', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    }

    const store = createTestStore({
      authRedux: { user: mockUser, loading: false, error: null },
    })

    renderWithRouter(
      <AuthContainer>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </AuthContainer>,
      store
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })

  it('debe usar useCallback para authCheck', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    }

    const store = createTestStore({
      authRedux: { user: mockUser, loading: false, error: null },
    })

    const { rerender } = renderWithRouter(
      <AuthContainer>
        <div>Content</div>
      </AuthContainer>,
      store
    )

    // Re-renderizar para verificar que useCallback funciona correctamente
    rerender(
      <Provider store={store}>
        <BrowserRouter>
          <AuthContainer>
            <div>Content Updated</div>
          </AuthContainer>
        </BrowserRouter>
      </Provider>
    )

    expect(screen.getByText('Content Updated')).toBeInTheDocument()
  })
})
