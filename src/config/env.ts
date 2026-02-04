/**
 * Configuración de variables de entorno
 * Todas las variables de entorno deben comenzar con VITE_ para ser expuestas al cliente
 */

export const env = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',

  // Application Configuration
  appName: import.meta.env.VITE_APP_NAME || 'NixTrack',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Google Maps (opcional)
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',

  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const

// Log para debug en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 Environment Config:', {
    apiBaseUrl: env.apiBaseUrl,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    mode: env.mode,
  })
}

// Validar variables de entorno requeridas
const validateEnv = () => {
  if (!env.apiBaseUrl) {
    console.warn('⚠️  VITE_API_BASE_URL no está configurada, usando valor por defecto')
  }
}

// Ejecutar validación en desarrollo
if (env.isDevelopment) {
  validateEnv()
}

export default env
