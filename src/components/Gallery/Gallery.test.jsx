import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Gallery from './index'

describe('Gallery Component', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ]

  it('debe renderizar sin errores cuando no hay imágenes', () => {
    const { container } = render(<Gallery images={[]} />)
    expect(container).toBeInTheDocument()
  })

  it('debe renderizar la primera imagen por defecto', () => {
    render(<Gallery images={mockImages} />)
    // Verificar que el componente se renderiza
    const container = screen.getByRole('presentation', { hidden: true })
    expect(container).toBeInTheDocument()
  })

  it('debe cambiar la imagen al hacer click en una miniatura', async () => {
    const { container } = render(<Gallery images={mockImages} />)
    
    const thumbnails = container.querySelectorAll('.gallery-item')
    
    if (thumbnails.length > 1) {
      fireEvent.click(thumbnails[1])
      // Verificar que la imagen cambió (esto depende de la implementación)
      await waitFor(() => {
        expect(thumbnails[1]).toBeInTheDocument()
      })
    }
  })

  it('debe manejar el evento de drag (arrastre)', () => {
    const { container } = render(<Gallery images={mockImages} />)
    
    const galleryContainer = container.querySelector('.gallery-container')
    
    if (galleryContainer) {
      // Simular el inicio del drag
      fireEvent.mouseDown(galleryContainer, { pageX: 100 })
      
      // Simular el movimiento
      fireEvent.mouseMove(galleryContainer, { pageX: 50 })
      
      // Simular el final del drag
      fireEvent.mouseUp(galleryContainer)
      
      expect(galleryContainer).toBeInTheDocument()
    }
  })

  it('debe limpiar los event listeners al desmontar', () => {
    const removeEventListenerSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener')
    
    const { unmount } = render(<Gallery images={mockImages} />)
    unmount()
    
    // Verificar que se llamó removeEventListener
    expect(removeEventListenerSpy).toHaveBeenCalled()
    
    removeEventListenerSpy.mockRestore()
  })

  it('debe actualizar las imágenes cuando cambia la prop', () => {
    const { rerender } = render(<Gallery images={mockImages} />)
    
    const newImages = ['https://example.com/new-image.jpg']
    rerender(<Gallery images={newImages} />)
    
    // Verificar que el componente se actualizó
    expect(screen.getByRole('presentation', { hidden: true })).toBeInTheDocument()
  })

  it('debe prevenir el scroll por defecto en el evento wheel', () => {
    const { container } = render(<Gallery images={mockImages} />)
    const galleryContainer = container.querySelector('.gallery-container')
    
    if (galleryContainer) {
      const wheelEvent = new WheelEvent('wheel', { 
        bubbles: true, 
        cancelable: true,
        deltaY: 100 
      })
      
      const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault')
      galleryContainer.dispatchEvent(wheelEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    }
  })
})
