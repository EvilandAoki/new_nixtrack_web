// Re-export all types
export * from './entities'
export * from './api'
export * from './redux'
export * from './forms'

// Constants
export const ROLES = {
  ADMIN: 1,
  SUPERVISOR: 2,
  OPERATOR: 3,
  CLIENT: 4,
} as const

export const ORDER_STATUS = {
  PENDING: 1, // Planeado/Pendiente
  IN_TRANSIT: 2, // Activo/En Tránsito
  AT_CHECKPOINT: 3, // En Punto de Control
  DELIVERED: 4, // Finalizado/Entregado
  CANCELLED: 5, // Cancelado
  DELAYED: 6, // Retrasado
  INCIDENT: 7, // Incidente
} as const

export const STATUS_LEVEL = {
  GREEN: 'verde',
  YELLOW: 'amarillo',
  RED: 'rojo',
} as const

export const SEQUENCE_NUMBER = {
  WITH_ISSUE: 0, // Con Novedad
  NO_ISSUE: 1, // Sin Novedad
} as const

export type RoleId = (typeof ROLES)[keyof typeof ROLES]
export type OrderStatusId = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]
export type StatusLevel = (typeof STATUS_LEVEL)[keyof typeof STATUS_LEVEL]
