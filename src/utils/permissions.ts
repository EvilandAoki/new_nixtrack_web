import { ROLES } from '@/types'

export const checkPermission = (userRoleId: number, allowedRoles: number[]): boolean => {
  return allowedRoles.includes(userRoleId)
}

export const isAdmin = (userRoleId: number): boolean => {
  return userRoleId === ROLES.ADMIN
}

export const isAdminClient = (userRoleId: number): boolean => {
  return userRoleId === ROLES.SUPERVISOR
}

export const canManageUsers = (userRoleId: number): boolean => {
  return isAdmin(userRoleId)
}

export const canManageClients = (userRoleId: number): boolean => {
  return isAdmin(userRoleId)
}

export const canManageVehicles = (userRoleId: number): boolean => {
  return isAdmin(userRoleId) || isAdminClient(userRoleId)
}

export const canManageAgents = (userRoleId: number): boolean => {
  return isAdmin(userRoleId) || isAdminClient(userRoleId)
}

export const canManageOrders = (userRoleId: number): boolean => {
  return isAdmin(userRoleId)
}

export const canCreateOrderDetails = (userRoleId: number): boolean => {
  return isAdmin(userRoleId) || isAdminClient(userRoleId)
}

export const canViewAllData = (userRoleId: number): boolean => {
  return isAdmin(userRoleId)
}
