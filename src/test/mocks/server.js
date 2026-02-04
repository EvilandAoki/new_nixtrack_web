import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configurar el servidor MSW para Node.js (tests)
export const server = setupServer(...handlers)

// Iniciar el servidor antes de todos los tests
export const setupMSW = () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
}
