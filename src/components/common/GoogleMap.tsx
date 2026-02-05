import { useEffect, useRef, useState } from 'react'
import { Spin } from 'antd'

// Declaración para window.google
declare global {
  interface Window {
    google: typeof google
  }
}

interface MapMarker {
  lat: number
  lng: number
  title: string
  info?: string
}

interface GoogleMapProps {
  markers: MapMarker[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: number | string
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  markers,
  center = { lat: 4.6097, lng: -74.0817 }, // Bogotá, Colombia por defecto
  zoom = 6,
  height = 400,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    // Verificar si Google Maps ya está cargado
    if (window.google && window.google.maps) {
      initMap()
    } else {
      loadGoogleMapsScript()
    }
  }, [])

  useEffect(() => {
    if (map && markers.length > 0) {
      updateMarkers()
      fitBounds()
    }
  }, [map, markers])

  const loadGoogleMapsScript = () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      setError('Google Maps API Key no configurada')
      setLoading(false)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      initMap()
    }
    script.onerror = () => {
      setError('Error al cargar Google Maps')
      setLoading(false)
    }
    document.head.appendChild(script)
  }

  const initMap = () => {
    if (!mapRef.current) return

    try {
      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      })

      setMap(mapInstance)
      setLoading(false)
    } catch (err) {
      console.error('Error inicializando mapa:', err)
      setError('Error al inicializar el mapa')
      setLoading(false)
    }
  }

  const updateMarkers = () => {
    if (!map) return

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Crear nuevos marcadores
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map,
        title: markerData.title,
        animation: google.maps.Animation.DROP,
      })

      // Crear InfoWindow si hay información adicional
      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0;">${markerData.title}</h4>
              <p style="margin: 0;">${markerData.info}</p>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })
      }

      markersRef.current.push(marker)
    })
  }

  const fitBounds = () => {
    if (!map || markers.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    markers.forEach((marker) => {
      bounds.extend({ lat: marker.lat, lng: marker.lng })
    })

    map.fitBounds(bounds)

    // Si solo hay un marcador, ajustar el zoom
    if (markers.length === 1) {
      map.setZoom(12)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          gap: 16,
        }}
      >
        <Spin size="large" />
        <span style={{ color: '#666' }}>Cargando mapa...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#fff1f0',
          border: '1px solid #ffccc7',
          borderRadius: 8,
          color: '#cf1322',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{error}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: 14 }}>
            {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY &&
              'Configure VITE_GOOGLE_MAPS_API_KEY en el archivo .env'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      style={{
        height,
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    />
  )
}

export default GoogleMap
