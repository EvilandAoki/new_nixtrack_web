/**
 * Utilidad para verificar la configuración de entorno
 * Ejecutar en la consola del navegador: checkEnv()
 */

import { env } from '@/config/env'

export const checkEnv = () => {
  console.group('🔧 Configuración de Entorno')
  
  console.log('📡 API Base URL:', env.apiBaseUrl)
  console.log('📱 App Name:', env.appName)
  console.log('🔢 App Version:', env.appVersion)
  console.log('🗺️  Google Maps API Key:', env.googleMapsApiKey ? '✅ Configurada' : '❌ No configurada')
  console.log('🌍 Environment:', env.mode)
  console.log('🔨 Is Development:', env.isDevelopment)
  console.log('🚀 Is Production:', env.isProduction)
  
  console.groupEnd()
  
  // Verificar conectividad con la API
  console.group('🔍 Verificación de Conectividad')
  
  fetch(`${env.apiBaseUrl}/health`)
    .then(response => {
      if (response.ok) {
        console.log('✅ API está accesible')
        return response.json()
      } else {
        console.error('❌ API respondió con error:', response.status)
      }
    })
    .then(data => {
      if (data) {
        console.log('📊 Respuesta de la API:', data)
      }
    })
    .catch(error => {
      console.error('❌ No se pudo conectar con la API:', error.message)
      console.log('💡 Verifica que el backend esté corriendo en:', env.apiBaseUrl)
    })
    .finally(() => {
      console.groupEnd()
    })
}

// Exponer globalmente en desarrollo
if (env.isDevelopment) {
  ;(window as any).checkEnv = checkEnv
  console.log('💡 Ejecuta checkEnv() en la consola para verificar la configuración')
}

export default checkEnv
