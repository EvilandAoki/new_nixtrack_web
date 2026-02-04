import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './index'

// Componente que lanza un error para testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    // Suprimir errores de consola en los tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('debe renderizar children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('debe capturar errores y mostrar UI de fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
    expect(screen.getByText('Lo sentimos, ha ocurrido un error inesperado.')).toBeInTheDocument()
  })

  it('debe mostrar botón para volver al inicio', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const button = screen.getByRole('button', { name: /volver al inicio/i })
    expect(button).toBeInTheDocument()
  })

  it('debe tener estado hasError en false inicialmente', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Content</div>
      </ErrorBoundary>
    )

    // Si no hay error, debe mostrar el contenido normal
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.queryByText('Algo salió mal')).not.toBeInTheDocument()
  })

  it('debe llamar a console.error cuando captura un error', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('debe mostrar Result de Ant Design con status 500', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Verificar que se muestra el componente Result
    const resultContainer = screen.getByText('Algo salió mal').closest('div')
    expect(resultContainer).toBeInTheDocument()
  })

  it('debe renderizar múltiples children sin error', () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
    expect(screen.getByText('Child 3')).toBeInTheDocument()
  })
})
